'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseGameTimerOptions {
  durationSec: number;
  onTimeUp: () => void;
}

export function useGameTimer({ durationSec, onTimeUp }: UseGameTimerOptions) {
  const [remainingSec, setRemainingSec] = useState(durationSec);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  const start = useCallback(() => {
    setRemainingSec(durationSec);
    setIsRunning(true);
  }, [durationSec]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setRemainingSec(durationSec);
  }, [durationSec]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemainingSec((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimeUpRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  return {
    remainingSec,
    isRunning,
    progress: 1 - remainingSec / durationSec,
    start,
    pause,
    resume,
    reset,
  };
}
