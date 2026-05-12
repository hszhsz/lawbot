import React from "react";
import { Box, Text } from "ink";

interface StatusBarProps {
  text: string;
  modelName: string;
  tokenCount?: number;
  slashHint?: boolean;
}

export function StatusBar({ text, modelName, tokenCount, slashHint }: StatusBarProps) {
  return (
    <Box
      width="100%"
      paddingX={1}
      paddingY={0}
      borderStyle="single"
      borderColor="#374151"
    >
      <Box flexGrow={1}>
        <Text dimColor>{text}</Text>
      </Box>
      {tokenCount !== undefined && tokenCount > 0 && (
        <Box marginLeft={2}>
          <Text dimColor>Tokens: {tokenCount.toLocaleString()}</Text>
        </Box>
      )}
      <Box marginLeft={2}>
        <Text dimColor>{modelName}</Text>
      </Box>
      {slashHint && (
        <Box marginLeft={2}>
          <Text dimColor>/help · Ctrl+C 退出</Text>
        </Box>
      )}
    </Box>
  );
}
