# 🏥 세 번째 팀 미팅 — 혀운동 게임 구현 착수

**일시**: 2026-03-04
**참석**: 🟠 정소리(SLP) · 🟣 이하늘(UI/UX) · 🔵 박건축(Architect) · 🟢 김코드(Dev)
**안건**: 혀운동 게임 구현 요구사항 최종 확인 + 구현 설계

---

## 🟠 정소리 — 임상 요구사항 최종 정리

> "지난 설계 미팅에서 합의한 내용을 기반으로, **MVP는 Level 1 (혀 내밀기)**부터 시작합니다."

### MVP (Level 1) 임상 기준

| 항목 | 값 | 근거 |
|------|-----|------|
| 동작 | **혀 내밀기 (tongue-out)** only | 가장 기본적인 혀 ROM 확인 |
| threshold | `tongueOut ≥ 0.4` | 과도한 내밀기 방지, 0.85 상한 |
| 유지 시간 | `300ms` (0.3초) | 턱(500ms)보다 짧게 — 혀 근육 피로 빠름 |
| 라운드 수 | 5라운드 | 집중력 유지 |
| 라운드 시간 | 10초 | 충분한 시도 기회 |
| 라운드 간 휴식 | **3초** | 혀 근육 피로 고려 (입 운동 2초보다 1초 추가) |

### 임상 주의사항
1. **혀 내밀기만 5라운드 반복** — Level 1에서는 단일 동작 반복이 치료적으로 올바름
2. **혀 근육은 턱보다 피로가 빠름** — 라운드 간 휴식 3초 필수
3. **침 흘림(drooling) 가능성** — 부모 안내에 "수건 준비" 포함
4. **과도한 내밀기 방지** — threshold 상한 0.85 이하

---

## 🟣 이하늘 — UI/UX 확인사항

### 디자인 결정
1. **제목**: "혀 운동 게임"
2. **색상**: `text-purple-500` (기존 TargetDisplay 구현 유지)
3. **안내 메시지**: 혀 내밀기 전용 격려 메시지
   - "혀를 내밀어봐! 😛"
   - "길~게 내밀어봐!"
   - "할 수 있어! 혀를 쭉!"
4. **pucker 경고 불필요** — 혀 운동에서는 입 오므리기 관련 경고 제거
5. **라운드 간 휴식 표시** — 3초 쉬는 시간에 "잠깐 쉬자! 🌟" + "혀가 힘들면 쉬어도 괜찮아~"

---

## 🔵 박건축 — 기술 설계

### 변경 범위

```
수정 (6개):
├── src/types/sensor.ts              — MouthMetrics에 tongue 4필드 추가
├── src/utils/faceGeometry.ts        — extractTongueMetrics() 추가
├── src/hooks/sensors/useMouthMetrics.ts — tongue 메트릭 추출 추가
├── src/constants/thresholds.ts      — tongue threshold 상수
├── src/constants/games.ts           — status: 'locked' → 'available'
└── src/app/(game)/result/page.tsx   — "한번 더!" 버튼 동적 라우팅

신규 (2개):
├── src/app/(game)/tongue-exercises/page.tsx      — 카메라 권한
└── src/app/(game)/tongue-exercises/play/page.tsx  — 게임 플레이
```

### 핵심 설계 결정
1. **`useMouthMetrics` 확장**: 기존 detection loop에서 tongue 블렌드셰이프도 함께 추출
2. **play 페이지**: mouth-opening/play 패턴 복사 후 sensor 값만 `tongueOut`으로 교체
3. **라운드 타입**: Level 1이므로 `tongue-out` 5개 고정 배열
4. **라운드 간 휴식**: 3초 rest overlay 추가 (RestOverlay 컴포넌트)
5. **결과 페이지**: `result.gameId`로 "한번 더!" 라우팅을 동적으로 처리

---

## 🟢 김코드 — 구현 순서

1. **센서 레이어** — `sensor.ts` → `faceGeometry.ts` → `useMouthMetrics.ts`
2. **상수** — `thresholds.ts` (tongue 상수) + `games.ts` (잠금 해제)
3. **페이지** — `tongue-exercises/page.tsx` (진입) + `play/page.tsx` (게임)
4. **결과 수정** — `result/page.tsx` "한번 더!" 버튼 동적화
5. **빌드 검증** — `npm run build`

---

## ✅ 합의 사항

| 항목 | 결정 |
|------|------|
| MVP 범위 | Level 1 (혀 내밀기) 5라운드 |
| threshold | `tongueOut ≥ 0.4`, hold `300ms` |
| 휴식 시간 | 3초 (rest overlay 표시) |
| 잠금 해제 | 즉시 available (테스트를 위해) |
| 결과 "한번 더!" | `gameId` 기반 동적 라우팅 |

---

## 📎 참고: 기존 입 운동 게임과의 차이

| 항목 | 입 운동 | 혀 운동 |
|------|---------|---------|
| 센서 | jawOpen, mouthPucker | tongueOut |
| 라운드 구성 | open/pucker 교대 랜덤 | tongue-out 단일 반복 |
| threshold | 0.6 (open), 0.4 (pucker) | 0.4 (tongue-out) |
| hold 시간 | 500ms | 300ms |
| 라운드 간 휴식 | 없음 (즉시 다음) | 3초 (RestOverlay) |
| 색상 톤 | 하늘+초록 | 보라 |
