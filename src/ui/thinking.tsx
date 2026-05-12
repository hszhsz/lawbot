import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";

const DOTS = [" .  ", " .. ", " ...", "  .."];

export function Thinking() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % DOTS.length);
    }, 300);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box>
      <Text color="#F59E0B">⚖ 思考中{DOTS[frame]}</Text>
    </Box>
  );
}
