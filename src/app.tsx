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
import { useStreamBuffer } from "./ui/use-stream-buffer.js";
import {
  type Message,
  type Session,
  createSession,
  addMessage,
  getMessages,
  listSessions,
} from "./session/store.js";

const HELP_TEXT = `╔══════════════════════════════════════════════════╗
║              ⚖ 法 · Lawbot 帮助                  ║
╠══════════════════════════════════════════════════╣
║  /help      显示此帮助                           ║
║  /sessions  切换会话侧栏    (同 Ctrl+S)           ║
║  /reset     新建会话                              ║
║  /model     显示当前模型                          ║
║  /clear     清屏                                  ║
║                                                  ║
║  Ctrl+C     退出 / 取消请求                       ║
║  Ctrl+S     切换侧栏                              ║
║  Esc        取消请求                              ║
╚══════════════════════════════════════════════════╝`;

interface AppProps {
  initialModel?: string;
  initialSessionId?: string;
}

export function App({ initialModel, initialSessionId }: AppProps) {
  const { exit } = useApp();
  const streamBuf = useStreamBuffer();

  const [config, setConfig] = useState<Config | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
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
  const [errorText, setErrorText] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamingMsgId = useRef("");

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

  // ── slash command handler ──
  const handleSlashCommand = useCallback(
    (cmd: string): string | null => {
      const parts = cmd.trim().split(/\s+/);
      const name = parts[0].toLowerCase();

      switch (name) {
        case "/help":
          return HELP_TEXT;
        case "/sessions":
          setShowSidebar((p) => !p);
          return `侧栏已${showSidebar ? "关闭" : "打开"} / Sidebar ${showSidebar ? "closed" : "opened"}`;
        case "/reset":
          setMessages([]);
          setActiveSession(null);
          streamBuf.reset();
          setStatusText("就绪 · Ready");
          setErrorText(null);
          return "已创建新会话 / New session created";
        case "/model":
          return config
            ? `当前模型 / Current: ${config.model.default}\nProvider: ${config.provider.type}`
            : "配置未加载 / Config not loaded";
        case "/clear":
          setMessages([]);
          setErrorText(null);
          streamBuf.reset();
          return null; // just clear, no message
        default:
          return `未知命令 / Unknown: ${name}\n输入 /help 查看帮助 / Type /help for commands`;
      }
    },
    [config, showSidebar, streamBuf],
  );

  // ── main submit ──
  const handleSubmit = useCallback(
    async (input: string) => {
      if (!input.trim() || !config) return;

      // Slash commands
      if (input.startsWith("/")) {
        const result = handleSlashCommand(input);
        if (result) {
          const cmdMsg: Message = {
            id: crypto.randomUUID(),
            sessionId: activeSession?.id ?? "system",
            role: "system",
            content: result,
            createdAt: Date.now(),
          };
          setMessages((prev) => [...prev, cmdMsg]);
        }
        return;
      }

      setInputHistory((prev) => [...prev, input]);
      setHistoryIndex(-1);
      setErrorText(null);
      streamBuf.reset();

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
      setStreamingToolCall(undefined);
      setStatusText("⚖ 思考中... / Thinking...");
      streamBuf.startFlush();

      const allMsgs = getMessages(session.id);
      const coreMessages: CoreMessage[] = allMsgs
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
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
            onToken: (token) => streamBuf.append(token),
            onToolCall: (toolName, status, result) => {
              setStreamingToolCall({ name: toolName, status, result });
              if (status === "running") {
                setStatusText(`⚙ 调用: ${toolName}`);
              } else if (status === "done") {
                setStatusText("⚖ 分析中... / Analyzing...");
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

        streamBuf.stopFlush();
        const content = streamBuf.display || fullText;

        const assistantMsg: Message = {
          id: assistantMsgId,
          sessionId: session.id,
          role: "assistant",
          content,
          createdAt: Date.now(),
        };
        addMessage(assistantMsg);
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        streamBuf.stopFlush();
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes("abort") || errMsg.includes("AbortError")) {
          setStatusText("已取消 / Cancelled");
        } else {
          setStatusText(`错误 / Error: ${errMsg}`);
          setErrorText(errMsg);
        }
        const content = streamBuf.display || `[Error] ${errMsg}`;
        const errorMsg: Message = {
          id: assistantMsgId,
          sessionId: session.id,
          role: "assistant",
          content,
          createdAt: Date.now(),
        };
        addMessage(errorMsg);
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsStreaming(false);
        setStreamingToolCall(undefined);
        streamBuf.reset();
        abortRef.current = null;
      }
    },
    [config, ensureSession, streamBuf, handleSlashCommand, activeSession],
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
    streamBuf.reset();
    setIsStreaming(false);
    setStatusText("就绪 · Ready");
    setErrorText(null);
  }, [streamBuf]);

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
          streamingContent={streamBuf.display}
          streamingToolCall={streamingToolCall}
          errorText={errorText}
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
        tokenCount={tokenCount}
        slashHint
      />
    </Box>
  );
}
