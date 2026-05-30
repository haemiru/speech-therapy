import { MEDIAPIPE_WASM_CDN } from '@/constants/thresholds';

/**
 * MediaPipe FaceLandmarker 설정
 * CDN에서 WASM + 모델 로드
 */
export const FACE_LANDMARKER_CONFIG = {
  wasmFilePath: MEDIAPIPE_WASM_CDN,
  modelAssetPath:
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  runningMode: 'VIDEO' as const,
  numFaces: 1,
  outputFaceBlendshapes: true,
  outputFacialTransformationMatrixes: false,
};
