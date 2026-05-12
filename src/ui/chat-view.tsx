import React from "react";
import { Box, Text } from "ink";
import type { Message } from "../session/store.js";
import { MessageBubble } from "./message.js";
import { Thinking } from "./thinking.js";

interface ChatViewProps {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
}

export function ChatView({
  messages,
  isStreaming,
  streamingContent,
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
          <Box flexDirection="column" alignItems="center">
            <Text bold color="#DC2626">
              ⚖ 法 · Lawbot
            </Text>
            <Text dimColor>专业中文法律 AI 智能体</Text>
            <Text dimColor>Professional Chinese Legal AI Agent</Text>
            <Box marginTop={1} flexDirection="column">
              <Text dimColor>你可以这样开始 / Try asking:</Text>
              <Text color="#F59E0B">
                · 根据民法典，合同违约的赔偿标准是什么？
              </Text>
              <Text color="#F59E0B">
                · 帮我审查这份租房合同的风险条款
              </Text>
              <Text color="#F59E0B">
                · 起草一份保密协议
              </Text>
              <Text color="#F59E0B">
                · 劳动合同到期不续签，公司需要支付补偿吗？
              </Text>
            </Box>
          </Box>
        </Box>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isStreaming && (
        <Box>
          <Thinking />
          {streamingContent ? (
            <Box marginLeft={2}>
              <Text>{streamingContent}</Text>
            </Box>
          ) : null}
        </Box>
      )}
    </Box>
  );
}
