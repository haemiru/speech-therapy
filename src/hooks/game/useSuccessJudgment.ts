'use client';

import { useRef, useState, useCallback } from 'react';

interface UseSuccessJudgmentOptions {
  threshold: number;
  holdDurationMs: number;
  onSuccess: () => void;
}

export function useSuccessJudgment({
  threshold,
  holdDurationMs,
  onSuccess,
}: UseSuccessJudgmentOptions) {
  const [isAtTarget, setIsAtTarget] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0~1
  const holdStartRef = useRef<number | null>(null);
  const succeededRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const update = useCallback(
    (value: number) => {
      if (succeededRef.current) return;

      const above = value >= threshold;
      setIsAtTarget(above);

      if (above) {
        if (!holdStartRef.current) {
          holdStartRef.current = Date.now();
        }
        const elapsed = Date.now() - holdStartRef.current;
        const progress = Math.min(1, elapsed / holdDurationMs);
        setHoldProgress(progress);

        if (elapsed >= holdDurationMs) {
          succeededRef.current = true;
          onSuccessRef.current();
        }
      } else {
        holdStartRef.current = null;
        setHoldProgress(0);
      }
    },
    [threshold, holdDurationMs]
  );

  const reset = useCallback(() => {
    holdStartRef.current = null;
    succeededRef.current = false;
    setIsAtTarget(false);
    setHoldProgress(0);
  }, []);

  return {
    isAtTarget,
    holdProgress,
    isSucceeded: succeededRef.current,
    update,
    reset,
  };
}
