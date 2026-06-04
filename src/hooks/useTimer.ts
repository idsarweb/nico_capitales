import { useState, useCallback, useRef, useEffect } from 'react';

export interface TimerState {
  remainingMs: number;
  isRunning: boolean;
  isExpired: boolean;
}

export function useTimer(totalMs: number, onExpire?: () => void) {
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const [isRunning, setIsRunning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef<number>(totalMs);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const tick = useCallback(() => {
    const now = Date.now();
    const elapsed = startTimeRef.current ? now - startTimeRef.current : 0;
    const next = Math.max(0, pausedRemainingRef.current - elapsed);
    setRemainingMs(Math.ceil(next));

    if (next <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRunning(false);
      setIsExpired(true);
      if (!hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpireRef.current?.();
      }
    }
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    setIsRunning(true);
    setIsExpired(false);
    hasExpiredRef.current = false;
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(tick, 32);
  }, [tick]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const now = Date.now();
    const elapsed = startTimeRef.current ? now - startTimeRef.current : 0;
    pausedRemainingRef.current = Math.max(0, pausedRemainingRef.current - elapsed);
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
    pausedRemainingRef.current = totalMs;
    setRemainingMs(totalMs);
    setIsRunning(false);
    setIsExpired(false);
    hasExpiredRef.current = false;
  }, [totalMs]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    remainingMs,
    isRunning,
    isExpired,
    start,
    pause,
    reset,
  };
}
