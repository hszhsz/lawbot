import React from "react";
import { Box, Text } from "ink";
import type { Session } from "../session/store.js";

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}

export function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
}: SidebarProps) {
  return (
    <Box
      width={24}
      flexDirection="column"
      borderStyle="single"
      borderColor="#374151"
      paddingX={1}
    >
      <Box marginY={1}>
        <Text bold>会话 / Sessions</Text>
      </Box>

      <Box marginY={1}>
        <Text color="#3B82F6" underline>
          + 新会话 / New Session
        </Text>
      </Box>

      {sessions.length === 0 && (
        <Box marginY={1}>
          <Text dimColor>暂无历史会话</Text>
        </Box>
      )}

      {sessions.map((s) => (
        <Box key={s.id} marginY={0}>
          <Text
            color={s.id === activeSessionId ? "#3B82F6" : undefined}
          >
            {s.id === activeSessionId ? "▸ " : "  "}
            {s.title.slice(0, 20)}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
