import { useRef, useState, useEffect, useCallback } from "react";

const FLUSH_INTERVAL = 50; // ms between renders

export function useStreamBuffer() {
  const bufferRef = useRef("");
  const [display, setDisplay] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flushingRef = useRef(false);

  const startFlush = useCallback(() => {
    if (timerRef.current) return;
    flushingRef.current = true;
    timerRef.current = setInterval(() => {
      if (bufferRef.current.length > 0) {
        setDisplay(bufferRef.current);
      }
    }, FLUSH_INTERVAL);
  }, []);

  const stopFlush = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Final flush
    setDisplay(bufferRef.current);
    flushingRef.current = false;
  }, []);

  const append = useCallback((token: string) => {
    bufferRef.current += token;
    if (!flushingRef.current) {
      setDisplay(bufferRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    bufferRef.current = "";
    setDisplay("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { display, append, reset, startFlush, stopFlush };
}
