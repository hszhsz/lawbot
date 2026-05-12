import React from "react";
import { Box, Text } from "ink";
import type { Message } from "../session/store.js";
import { MessageBubble } from "./message.js";
import { Thinking } from "./thinking.js";
import { ToolCall } from "./tool-call.js";

interface ChatViewProps {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  streamingToolCall?: { name: string; status: "running" | "done" | "error"; result?: string };
  errorText?: string | null;
}

const WELCOME = `╔══════════════════════════════════════════════════╗
║                                                  ║
║         ⚖  法 · Lawbot                          ║
║        专业中文法律 AI 智能体                      ║
║        Professional Chinese Legal AI Agent       ║
║                                                  ║
╠══════════════════════════════════════════════════╣
║  你可以这样开始 / Try asking:                     ║
║                                                  ║
║  · 根据民法典，合同违约的赔偿标准是什么？          ║
║  · 帮我审查这份租房合同的风险条款                  ║
║  · 起草一份保密协议                               ║
║  · 劳动合同到期不续签需要支付补偿吗？               ║
║                                                  ║
║  输入 /help 查看命令列表 / Type /help for help     ║
╚══════════════════════════════════════════════════╝`;

export function ChatView({
  messages,
  isStreaming,
  streamingContent,
  streamingToolCall,
  errorText,
}: ChatViewProps) {
  return (
    <Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={0}>
      {messages.length === 0 && !isStreaming && (
        <Box
          flexDirection="column"
          flexGrow={1}
          justifyContent="center"
          alignItems="center"
        >
          <Text color="#DC2626">{WELCOME}</Text>
        </Box>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isStreaming && (
        <Box flexDirection="column">
          <Box>
            <Thinking />
          </Box>
          {streamingToolCall && (
            <ToolCall
              toolName={streamingToolCall.name}
              status={streamingToolCall.status}
              result={streamingToolCall.result}
            />
          )}
          {streamingContent && (
            <Box paddingLeft={2} marginTop={0}>
              <Text>{streamingContent}</Text>
            </Box>
          )}
        </Box>
      )}

      {errorText && (
        <Box marginY={1} paddingX={2}>
          <Text color="#EF4444">错误 / Error: {errorText}</Text>
        </Box>
      )}
    </Box>
  );
}
