import React, { useState, useCallback, useRef, useEffect } from "react";
import { Box, Text, useInput, useApp } from "ink";
import type { CoreMessage } from "ai";
import { Header } from "./ui/header.js";
import { ChatView } from "./ui/chat-view.js";
import { InputBar } from "./ui/input-bar.js";
import { StatusBar } from "./ui/status-bar.js";
import { Sidebar } from "./ui/sidebar.js";
import { loadConfig, createDefaultConfigFile } from "./config/loader.js";
import type { Config } from "./config/types.js";
import { getModel } from "./provider/registry.js";
import { runAgent } from "./agent/loop.js";
import {
  type Message,
  type Session,
  createSession,
  addMessage,
  getMessages,
  listSessions,
} from "./session/store.js";

interface AppProps {
  initialModel?: string;
  initialSessionId?: string;
}

export function App({ initialModel, initialSessionId }: AppProps) {
  const { exit } = useApp();
  const [config, setConfig] = useState<Config | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingToolCall, setStreamingToolCall] = useState<
    { name: string; status: "running" | "done" | "error"; result?: string } | undefined
  >();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [statusText, setStatusText] = useState("就绪 · Ready");
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tokenCount, setTokenCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const streamingMsgId = useRef<string>("");

  // Load config on mount
  useEffect(() => {
    try {
      const loaded = loadConfig(initialModel);
      setConfig(loaded);
      if (initialSessionId) {
        const msgs = getMessages(initialSessionId);
        setMessages(msgs);
        const session = createSession("已恢复的会话");
        session.id = initialSessionId;
        setActiveSession(session);
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      if (errMsg.includes("ENOENT") || errMsg.includes("no such file")) {
        try {
          const path = createDefaultConfigFile();
          setConfigError(
            `已创建默认配置文件于 ${path}\n请编辑后重新启动。\nDefault config created at ${path}\nPlease edit and restart.`,
          );
        } catch {
          setConfigError(errMsg);
        }
      } else {
        setConfigError(errMsg);
      }
    }
  }, [initialModel, initialSessionId]);

  // Refresh session list
  useEffect(() => {
    setSessions(listSessions());
  }, [messages.length]);

  const ensureSession = useCallback((): Session => {
    if (!activeSession) {
      const session = createSession();
      setActiveSession(session);
      return session;
    }
    return activeSession;
  }, [activeSession]);

  const handleSubmit = useCallback(
    async (input: string) => {
      if (!input.trim() || !config) return;

      // Track input history
      setInputHistory((prev) => [...prev, input]);
      setHistoryIndex(-1);

      const session = ensureSession();
      const userMsg: Message = {
        id: crypto.randomUUID(),
        sessionId: session.id,
        role: "user",
        content: input,
        createdAt: Date.now(),
      };
      addMessage(userMsg);
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      setStreamingContent("");
      setStreamingToolCall(undefined);
      setStatusText("思考中... / Thinking...");

      // Build CoreMessage array for LLM
      const allMsgs = getMessages(session.id);
      const coreMessages: CoreMessage[] = allMsgs.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const abortController = new AbortController();
      abortRef.current = abortController;
      const assistantMsgId = crypto.randomUUID();
      streamingMsgId.current = assistantMsgId;

      try {
        const model = getModel(config);
        const fullText = await runAgent({
          model,
          config,
          messages: coreMessages,
          callbacks: {
            onToken: (token) => {
              setStreamingContent((prev) => prev + token);
            },
            onToolCall: (toolName, status, result) => {
              setStreamingToolCall({ name: toolName, status, result });
              if (status === "running") {
                setStatusText(`调用工具: ${toolName}...`);
              }
            },
            onFinish: (usage) => {
              setTokenCount((prev) => prev + usage.promptTokens + usage.completionTokens);
              setStatusText(
                `就绪 · Ready (${usage.promptTokens}+${usage.completionTokens} tokens)`,
              );
            },
            onError: (error) => {
              setStatusText(`错误 / Error: ${error.message}`);
            },
          },
          abortSignal: abortController.signal,
        });

        // Save assistant message
        const assistantMsg: Message = {
          id: assistantMsgId,
          sessionId: session.id,
          role: "assistant",
          content: fullText,
          createdAt: Date.now(),
        };
        addMessage(assistantMsg);
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes("abort") || errMsg.includes("AbortError")) {
          setStatusText("已取消 / Cancelled");
        } else {
          setStatusText(`错误 / Error: ${errMsg}`);
        }
        // Save partial as error message
        const errorMsg: Message = {
          id: assistantMsgId,
          sessionId: session.id,
          role: "assistant",
          content: streamingContent || `[Error] ${errMsg}`,
          createdAt: Date.now(),
        };
        addMessage(errorMsg);
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        setStreamingToolCall(undefined);
        abortRef.current = null;
      }
    },
    [config, ensureSession, streamingContent],
  );

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  useInput((input, key) => {
    if (key.ctrl && input === "c") {
      if (isStreaming) {
        handleCancel();
        return;
      }
      exit();
      return;
    }
    if (key.ctrl && input === "s") {
      setShowSidebar((prev) => !prev);
      return;
    }
    if (key.escape && isStreaming) {
      handleCancel();
      return;
    }
  });

  const handleNewSession = useCallback(() => {
    setMessages([]);
    setActiveSession(null);
    setStreamingContent("");
    setIsStreaming(false);
    setStatusText("就绪 · Ready");
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    const msgs = getMessages(id);
    setMessages(msgs);
    const session = { id, title: id, createdAt: 0, updatedAt: 0 };
    setActiveSession(session);
  }, []);

  if (configError) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text bold color="#DC2626">
            ⚖ 法 · Lawbot
          </Text>
        </Box>
        <Text color="red">{configError}</Text>
      </Box>
    );
  }

  if (!config) {
    return (
      <Box padding={1}>
        <Text>加载中... / Loading...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" width="100%" height="100%">
      <Header sessionTitle={activeSession?.title ?? "Lawbot"} />
      <Box flexDirection="row" flexGrow={1}>
        {showSidebar && (
          <Sidebar
            sessions={sessions}
            activeSessionId={activeSession?.id ?? null}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
          />
        )}
        <ChatView
          messages={messages}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
        />
      </Box>
      <InputBar
        onSubmit={handleSubmit}
        isProcessing={isStreaming}
        history={inputHistory}
        historyIndex={historyIndex}
        onHistoryChange={setHistoryIndex}
      />
      <StatusBar
        text={statusText}
        modelName={config.model.default}
      />
    </Box>
  );
}
