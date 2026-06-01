'use client';

import { useCallback, useRef, useState } from 'react';
import { jamoSimilarity } from '@/utils/koreanJamo';
import type { SpeechRecognitionResult } from '@/types/speech';

// Web Speech API 타입 (Chromium 전용)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [needsRetry, setNeedsRetry] = useState(false);
  // 진단용: 마지막 오류 코드 / 인식 결과 수신 횟수
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null);
  const [resultCount, setResultCount] = useState(0);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const targetWordRef = useRef('');
  const shouldRestartRef = useRef(false);
  const onResultRef = useRef<((result: SpeechRecognitionResult) => void) | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSupported = getSpeechRecognition() !== null;

  const init = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      setError('이 브라우저는 음성 인식을 지원하지 않아요. Chrome 브라우저를 사용해주세요.');
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'ko-KR';
    // 라운드 내내 마이크를 열어 두어 아이가 말하는 순간을 놓치지 않음
    recognition.continuous = true;
    recognition.interimResults = true;
    // ASR이 정답을 2·3순위 후보로 두는 경우가 많아 여러 후보를 받아 가장 유사한 것을 채택
    recognition.maxAlternatives = 5;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      const isFinal = lastResult.isFinal;
      const target = targetWordRef.current;

      // 모든 후보 중 목표 단어와 가장 유사한 것을 선택
      let bestText = lastResult[0].transcript.trim();
      let bestSim = jamoSimilarity(target, bestText);
      for (let i = 1; i < lastResult.length; i++) {
        const altText = lastResult[i].transcript.trim();
        const altSim = jamoSimilarity(target, altText);
        if (altSim > bestSim) {
          bestSim = altSim;
          bestText = altText;
        }
      }

      const confidence = lastResult[0].confidence;
      setTranscript(bestText);
      setResultCount((c) => c + 1);

      onResultRef.current?.({
        transcript: bestText,
        confidence,
        similarity: bestSim,
        isFinal,
      });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setLastErrorCode(event.error);
      // 'no-speech'·'aborted'·'network'는 복구 가능 → onend의 자동 재시작에 맡김
      if (event.error === 'no-speech' || event.error === 'aborted' || event.error === 'network') {
        return;
      }
      if (event.error === 'not-allowed') {
        setError('마이크 권한이 필요합니다. 브라우저 설정에서 마이크를 허용해주세요.');
      } else if (event.error === 'service-not-allowed' || event.error === 'language-not-supported') {
        setError('이 브라우저는 음성 인식을 지원하지 않아요. Chrome 브라우저를 사용해주세요.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // 라운드 진행 중이면 자동 재시작 (아이가 말할 때까지 계속 듣기)
      // 동기 재시작은 InvalidStateError가 잦으므로 약간의 지연 후 시작
      if (shouldRestartRef.current) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (!shouldRestartRef.current) return;
          try {
            recognition.start();
            setIsListening(true);
          } catch {
            setNeedsRetry(true);
          }
        }, 250);
      }
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = useCallback((
    targetWord: string,
    onResult: (result: SpeechRecognitionResult) => void,
  ) => {
    if (!recognitionRef.current) return;

    targetWordRef.current = targetWord;
    onResultRef.current = onResult;
    shouldRestartRef.current = true;
    setTranscript('');
    setError(null);
    setNeedsRetry(false);
    setLastErrorCode(null);
    setResultCount(0);

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // 이미 시작된 경우 무시
    }
  }, []);

  // 사용자 제스처(탭)로 인식 재시작
  const retry = useCallback(() => {
    if (!recognitionRef.current || !shouldRestartRef.current) return;

    setNeedsRetry(false);
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // 이미 시작된 경우 무시
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    onResultRef.current = null;
    setNeedsRetry(false);
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // 이미 중지된 경우 무시
      }
    }
    setIsListening(false);
  }, []);

  return {
    isSupported,
    isListening,
    needsRetry,
    transcript,
    error,
    lastErrorCode,
    resultCount,
    init,
    startListening,
    stopListening,
    retry,
  };
}
