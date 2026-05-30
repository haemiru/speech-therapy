export interface SensorState<T> {
  isReady: boolean;
  isActive: boolean;
  value: T | null;
  error: string | null;
}

export interface MouthMetrics {
  jawOpen: number;       // 0.0 ~ 1.0
  mouthOpen: number;     // 입 벌림 정도 (합산)
  mouthPucker: number;   // 0.0 ~ 1.0 입 오므리기 정도
  lipDistance: number;    // 윗입술-아랫입술 거리 (정규화)
}

export interface FaceLandmarkerResult {
  faceDetected: boolean;
  blendshapes: Record<string, number> | null;
  landmarks: Array<{ x: number; y: number; z: number }> | null;
}
