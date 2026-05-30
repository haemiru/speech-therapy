'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { CAMERA_CONSTRAINTS } from '@/constants/thresholds';

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'error';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    if (streamRef.current) return; // already running

    setStatus('requesting');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus('active');
    } catch (err) {
      const e = err as DOMException;
      if (e.name === 'NotAllowedError') {
        setStatus('denied');
        setError('카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해 주세요.');
      } else if (e.name === 'NotFoundError') {
        setStatus('error');
        setError('카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해 주세요.');
      } else {
        setStatus('error');
        setError(`카메라 오류: ${e.message}`);
      }
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    status,
    error,
    start,
    stop,
    isActive: status === 'active',
  };
}
