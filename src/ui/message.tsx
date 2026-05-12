import React from "react";
import { Box, Text } from "ink";
import type { Message } from "../session/store.js";
import { MarkdownRenderer } from "./markdown.js";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <Box
      flexDirection="column"
      marginY={1}
      paddingX={1}
    >
      <Box>
        <Text bold color={isUser ? "#3B82F6" : "#DC2626"}>
          {isUser ? "▸ 你 / You" : "⚖ Lawbot"}
        </Text>
      </Box>
      <Box marginTop={0} paddingLeft={2}>
        <MarkdownRenderer content={message.content} />
      </Box>
    </Box>
  );
}
