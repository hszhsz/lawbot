import React from "react";
import { Box, Text } from "ink";

interface StatusBarProps {
  text: string;
  modelName: string;
}

export function StatusBar({ text, modelName }: StatusBarProps) {
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
      <Box marginLeft={2}>
        <Text dimColor>Model: {modelName}</Text>
      </Box>
      <Box marginLeft={2}>
        <Text dimColor>Ctrl+C 退出</Text>
      </Box>
    </Box>
  );
}
