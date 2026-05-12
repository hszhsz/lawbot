import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";

const FRAMES = ["⚖", "⚖"];

export function Thinking() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box paddingLeft={1}>
      <Text color="#DC2626">{FRAMES[frame]} </Text>
      <Text dimColor>...</Text>
    </Box>
  );
}
