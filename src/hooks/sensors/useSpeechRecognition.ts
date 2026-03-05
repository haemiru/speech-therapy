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

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const targetWordRef = useRef('');
  const shouldRestartRef = useRef(false);
  const onResultRef = useRef<((result: SpeechRecognitionResult) => void) | null>(null);

  const isSupported = getSpeechRecognition() !== null;

  const init = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      setError('이 브라우저는 음성 인식을 지원하지 않아요. Chrome 브라우저를 사용해주세요.');
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      const transcriptText = lastResult[0].transcript.trim();
      const confidence = lastResult[0].confidence;
      const isFinal = lastResult.isFinal;

      setTranscript(transcriptText);

      const similarity = jamoSimilarity(targetWordRef.current, transcriptText);

      onResultRef.current?.({
        transcript: transcriptText,
        confidence,
        similarity,
        isFinal,
      });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 'no-speech'와 'aborted'는 정상적인 경우
      if (event.error === 'no-speech' || event.error === 'aborted') {
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
      // 라운드 진행 중이면 자동 재시작 (재시도 허용)
      if (shouldRestartRef.current) {
        try {
          recognition.start();
          setIsListening(true);
        } catch {
          // 이미 시작된 경우 무시
        }
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
    transcript,
    error,
    init,
    startListening,
    stopListening,
  };
}
