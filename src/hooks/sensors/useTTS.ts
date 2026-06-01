'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SPEECH_TTS_RATE } from '@/constants/thresholds';

/**
 * 사용 가능한 음성 중 한국어 발음에 가장 적합한 것을 선택.
 * - 영어 기본 음성이 한국어를 읽으면 발음이 뭉개지므로 ko 음성을 명시적으로 고른다.
 * - Google(고품질, 온라인) > 기타 ko 음성 > null(브라우저 기본) 순.
 */
function pickKoreanVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const ko = voices.filter(
    (v) => v.lang === 'ko-KR' || v.lang === 'ko_KR' || v.lang.toLowerCase().startsWith('ko')
  );
  if (!ko.length) return null;

  // 고품질 우선순위: Google > Microsoft(로컬) > 첫 번째
  return (
    ko.find((v) => /google/i.test(v.name)) ??
    ko.find((v) => /microsoft|heami|sun-?hi/i.test(v.name)) ??
    ko[0]
  );
}

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // 음성 목록은 비동기로 로드된다 → voiceschanged 이벤트로 갱신
  useEffect(() => {
    if (!isSupported) return;
    const load = () => {
      voiceRef.current = pickKoreanVoice();
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, [isSupported]);

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
      utterance.pitch = 1.0; // 명료한 발음을 위해 기본 톤

      // 한국어 음성 명시 (없으면 늦게 로드됐을 수 있으니 한 번 더 시도)
      const voice = voiceRef.current ?? pickKoreanVoice();
      if (voice) {
        voiceRef.current = voice;
        utterance.voice = voice;
      }

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
