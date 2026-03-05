'use client';

import { useCallback, useRef, useState } from 'react';
import type { SpeechRecognitionResult } from '@/types/speech';

interface UseSpeechJudgmentOptions {
  threshold: number;
  onSuccess: (result: SpeechRecognitionResult) => void;
}

export function useSpeechJudgment({ threshold, onSuccess }: UseSpeechJudgmentOptions) {
  const [bestScore, setBestScore] = useState(0);
  const [bestTranscript, setBestTranscript] = useState('');
  const [hasSucceeded, setHasSucceeded] = useState(false);
  const [lastResult, setLastResult] = useState<SpeechRecognitionResult | null>(null);

  const succeededRef = useRef(false);
  const bestScoreRef = useRef(0);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const judge = useCallback((result: SpeechRecognitionResult) => {
    if (succeededRef.current) return;

    setLastResult(result);

    // 최고 점수 갱신
    if (result.similarity > bestScoreRef.current) {
      bestScoreRef.current = result.similarity;
      setBestScore(result.similarity);
      setBestTranscript(result.transcript);
    }

    // 성공 판정
    if (result.similarity >= threshold) {
      succeededRef.current = true;
      setHasSucceeded(true);
      onSuccessRef.current(result);
    }
  }, [threshold]);

  const reset = useCallback(() => {
    succeededRef.current = false;
    bestScoreRef.current = 0;
    setBestScore(0);
    setBestTranscript('');
    setHasSucceeded(false);
    setLastResult(null);
  }, []);

  return {
    judge,
    bestScore,
    bestTranscript,
    hasSucceeded,
    lastResult,
    reset,
  };
}
