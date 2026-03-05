'use client';

import { useCallback, useRef, useState } from 'react';
import { SPEECH_TTS_RATE } from '@/constants/thresholds';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        reject(new Error('TTS not supported'));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = SPEECH_TTS_RATE;
      utterance.pitch = 1.1; // 살짝 높은 톤 (아이 친화적)

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (e) => {
        setIsSpeaking(false);
        // 'canceled' 이벤트는 무시 (speak 중복 호출 시 발생)
        if (e.error === 'canceled') {
          resolve();
        } else {
          reject(e);
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);

      // Timeout: if TTS doesn't fire onend/onerror within 5s (e.g. autoplay blocked), resolve anyway
      const timeout = setTimeout(() => {
        setIsSpeaking(false);
        resolve();
      }, 5000);

      const origOnEnd = utterance.onend;
      const origOnError = utterance.onerror;
      utterance.onend = (ev) => {
        clearTimeout(timeout);
        origOnEnd?.call(utterance, ev);
      };
      utterance.onerror = (ev) => {
        clearTimeout(timeout);
        origOnError?.call(utterance, ev);
      };
    });
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return { speak, cancel, isSpeaking, isSupported };
}
