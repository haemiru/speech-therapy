/**
 * MediaPipe Face Landmarker blendshape 인덱스에서 jawOpen 추출
 */
export function extractJawOpen(
  blendshapes: Array<{ categoryName: string; score: number }> | undefined
): number {
  if (!blendshapes) return 0;
  const jawOpen = blendshapes.find((b) => b.categoryName === 'jawOpen');
  return jawOpen?.score ?? 0;
}

/**
 * MediaPipe Face Landmarker blendshapes에서 입 관련 메트릭 추출
 */
export function extractMouthMetrics(
  blendshapes: Array<{ categoryName: string; score: number }> | undefined
): { jawOpen: number; mouthOpen: number; mouthPucker: number } {
  if (!blendshapes) return { jawOpen: 0, mouthOpen: 0, mouthPucker: 0 };

  const jawOpen =
    blendshapes.find((b) => b.categoryName === 'jawOpen')?.score ?? 0;
  const mouthOpen =
    blendshapes.find((b) => b.categoryName === 'mouthOpen')?.score ?? 0;
  const mouthPucker =
    blendshapes.find((b) => b.categoryName === 'mouthPucker')?.score ?? 0;

  return { jawOpen, mouthOpen, mouthPucker };
}

/**
 * 0~1 값을 백분율 문자열로 변환
 */
export function toPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * 임계값 기반 성공 판정
 */
export function isAboveThreshold(value: number, threshold: number): boolean {
  return value >= threshold;
}
