import React, { useState, useCallback } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";

interface InputBarProps {
  onSubmit: (value: string) => void;
  isProcessing: boolean;
  history: string[];
  historyIndex: number;
  onHistoryChange: (index: number) => void;
}

export function InputBar({
  onSubmit,
  isProcessing,
  history,
  historyIndex,
  onHistoryChange,
}: InputBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(
    (val: string) => {
      const trimmed = val.trim();
      if (!trimmed || isProcessing) return;
      onSubmit(trimmed);
      setValue("");
    },
    [onSubmit, isProcessing],
  );

  return (
    <Box
      width="100%"
      paddingX={1}
      paddingY={0}
      borderStyle="round"
      borderColor="#374151"
    >
      <Box marginRight={1}>
        <Text color="#DC2626">
          {isProcessing ? "⏳" : "▸"}
        </Text>
      </Box>
      <Box flexGrow={1}>
        {isProcessing ? (
          <Text dimColor>等待回复中... / Waiting for response...</Text>
        ) : (
          <TextInput
            value={value}
            onChange={setValue}
            onSubmit={handleSubmit}
            placeholder="输入法律问题... / Ask a legal question..."
          />
        )}
      </Box>
    </Box>
  );
}
