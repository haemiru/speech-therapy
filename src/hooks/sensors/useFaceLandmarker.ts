'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { FACE_LANDMARKER_CONFIG } from '@/lib/mediapipe';

type FaceLandmarkerType = import('@mediapipe/tasks-vision').FaceLandmarker;
type FilesetResolverType = typeof import('@mediapipe/tasks-vision').FilesetResolver;

interface FaceLandmarkerState {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
}

export function useFaceLandmarker() {
  const landmarkerRef = useRef<FaceLandmarkerType | null>(null);
  const initializingRef = useRef(false);
  const [state, setState] = useState<FaceLandmarkerState>({
    isLoading: false,
    isReady: false,
    error: null,
  });

  const init = useCallback(async () => {
    if (landmarkerRef.current || initializingRef.current) return;
    initializingRef.current = true;

    setState({ isLoading: true, isReady: false, error: null });

    try {
      // Dynamic import to avoid SSR issues
      const vision = await import('@mediapipe/tasks-vision');
      const { FaceLandmarker, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        FACE_LANDMARKER_CONFIG.wasmFilePath
      );

      const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: FACE_LANDMARKER_CONFIG.modelAssetPath,
          delegate: 'GPU',
        },
        runningMode: FACE_LANDMARKER_CONFIG.runningMode,
        numFaces: FACE_LANDMARKER_CONFIG.numFaces,
        outputFaceBlendshapes: FACE_LANDMARKER_CONFIG.outputFaceBlendshapes,
        outputFacialTransformationMatrixes:
          FACE_LANDMARKER_CONFIG.outputFacialTransformationMatrixes,
      });

      landmarkerRef.current = landmarker;
      setState({ isLoading: false, isReady: true, error: null });
    } catch (err) {
      console.error('FaceLandmarker init error:', err);
      initializingRef.current = false;
      setState({
        isLoading: false,
        isReady: false,
        error: `얼굴 인식 모델 로드 실패: ${(err as Error).message}`,
      });
    }
  }, []);

  const detectForVideo = useCallback(
    (video: HTMLVideoElement, timestampMs: number) => {
      if (!landmarkerRef.current) return null;
      try {
        return landmarkerRef.current.detectForVideo(video, timestampMs);
      } catch {
        return null;
      }
    },
    []
  );

  const close = useCallback(() => {
    if (landmarkerRef.current) {
      landmarkerRef.current.close();
      landmarkerRef.current = null;
    }
    setState({ isLoading: false, isReady: false, error: null });
  }, []);

  useEffect(() => {
    return () => {
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []);

  return {
    ...state,
    init,
    detectForVideo,
    close,
  };
}
