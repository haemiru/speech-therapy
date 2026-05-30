'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useFaceLandmarker } from './useFaceLandmarker';
import { extractMouthMetrics } from '@/utils/faceGeometry';
import type { MouthMetrics } from '@/types/sensor';

interface MouthMetricsState {
  isReady: boolean;
  isActive: boolean;
  isLoading: boolean;
  faceDetected: boolean;
  error: string | null;
}

export function useMouthMetrics() {
  const faceLandmarker = useFaceLandmarker();
  const animFrameRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const metricsRef = useRef<MouthMetrics | null>(null);
  const [state, setState] = useState<MouthMetricsState>({
    isReady: false,
    isActive: false,
    isLoading: false,
    faceDetected: false,
    error: null,
  });

  // Initialize model
  const init = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    await faceLandmarker.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update state when landmarker is ready
  useEffect(() => {
    if (faceLandmarker.isReady) {
      setState((s) => ({ ...s, isReady: true, isLoading: false }));
    }
    if (faceLandmarker.error) {
      setState((s) => ({ ...s, error: faceLandmarker.error, isLoading: false }));
    }
  }, [faceLandmarker.isReady, faceLandmarker.error]);

  // Detection loop
  const startDetection = useCallback(
    (video: HTMLVideoElement) => {
      videoRef.current = video;
      setState((s) => ({ ...s, isActive: true }));

      const detect = () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          animFrameRef.current = requestAnimationFrame(detect);
          return;
        }

        const result = faceLandmarker.detectForVideo(
          videoRef.current,
          performance.now()
        );

        if (result && result.faceBlendshapes && result.faceBlendshapes.length > 0) {
          const blendshapes = result.faceBlendshapes[0].categories;
          const { jawOpen, mouthOpen, mouthPucker } = extractMouthMetrics(blendshapes);
          metricsRef.current = { jawOpen, mouthOpen, mouthPucker, lipDistance: jawOpen };
          setState((s) => (s.faceDetected ? s : { ...s, faceDetected: true }));
        } else {
          metricsRef.current = null;
          setState((s) => (!s.faceDetected ? s : { ...s, faceDetected: false }));
        }

        animFrameRef.current = requestAnimationFrame(detect);
      };

      animFrameRef.current = requestAnimationFrame(detect);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const stopDetection = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    videoRef.current = null;
    metricsRef.current = null;
    setState((s) => ({ ...s, isActive: false }));
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    metricsRef,
    init,
    startDetection,
    stopDetection,
  };
}
