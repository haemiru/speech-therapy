'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import {
  SOUND_SILENCE_DB,
  SOUND_MAX_DB,
} from '@/constants/thresholds';

interface MicrophoneVolumeState {
  isReady: boolean;
  isActive: boolean;
  error: string | null;
}

export function useMicrophoneVolume() {
  const [state, setState] = useState<MicrophoneVolumeState>({
    isReady: false,
    isActive: false,
    error: null,
  });

  const volumeRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const init = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      dataArrayRef.current = new Uint8Array(analyser.fftSize) as Uint8Array<ArrayBuffer>;

      setState({ isReady: true, isActive: false, error: null });
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? '마이크 권한이 거부되었습니다. 설정에서 마이크 접근을 허용해주세요.'
          : '마이크 연결에 실패했습니다.';
      setState({ isReady: false, isActive: false, error: message });
    }
  }, []);

  const startDetection = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    setState((s) => ({ ...s, isActive: true }));

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    const dbRange = SOUND_MAX_DB - SOUND_SILENCE_DB; // 50

    const tick = () => {
      analyser.getByteTimeDomainData(dataArray);

      // RMS calculation
      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128; // -1 to 1
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length);

      // Convert to dB
      const dB = rms > 0 ? 20 * Math.log10(rms) : SOUND_SILENCE_DB;

      // Normalize to 0~1
      const normalizedVolume = Math.max(0, Math.min(1, (dB - SOUND_SILENCE_DB) / dbRange));
      volumeRef.current = normalizedVolume;

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const stopDetection = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    volumeRef.current = 0;
    setState((s) => ({ ...s, isActive: false }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    ...state,
    volumeRef,
    init,
    startDetection,
    stopDetection,
  };
}
