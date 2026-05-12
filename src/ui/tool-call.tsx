import React, { useState } from "react";
import { Box, Text } from "ink";

interface ToolCallProps {
  toolName: string;
  status: "running" | "done" | "error";
  result?: string;
}

export function ToolCall({ toolName, status, result }: ToolCallProps) {
  const [expanded, setExpanded] = useState(false);

  const statusColor = {
    running: "#F59E0B",
    done: "#10B981",
    error: "#EF4444",
  }[status];

  const statusIcon = {
    running: "⟳",
    done: "✓",
    error: "✗",
  }[status];

  return (
    <Box flexDirection="column" marginLeft={2} marginY={1}>
      <Box>
        <Text color={statusColor}>
          {statusIcon} [{toolName}]
        </Text>
        {result && (
          <Text
            dimColor
            wrap="truncate-end"
          >
            {" "}
            — {result.slice(0, 80)}
          </Text>
        )}
      </Box>
      {expanded && result && (
        <Box marginLeft={2} paddingLeft={1} paddingY={0}>
          <Text dimColor>{result}</Text>
        </Box>
      )}
    </Box>
  );
}
