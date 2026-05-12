import React from "react";
import { Box, Text } from "ink";

interface HeaderProps {
  sessionTitle: string;
}

export function Header({ sessionTitle }: HeaderProps) {
  return (
    <Box
      width="100%"
      paddingX={1}
      paddingY={0}
      borderStyle="single"
      borderColor="#374151"
    >
      <Box flexGrow={1}>
        <Text bold color="#DC2626">
          ⚖ 法 · Lawbot
        </Text>
      </Box>
      <Box>
        <Text dimColor>{sessionTitle.slice(0, 30)}</Text>
      </Box>
    </Box>
  );
}
