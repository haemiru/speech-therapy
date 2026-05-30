export interface ChildProfile {
  name: string;
  age: number;           // 세
  createdAt: number;
}

import type { SpeechLevel } from '@/types/speech';

export interface TherapistSettings {
  mouthOpenThreshold: number;   // 0.0 ~ 1.0, 기본 0.6
  lipPuckerThreshold: number;   // 0.0 ~ 1.0, 기본 0.4
  holdDurationMs: number;       // 성공 판정 유지 시간, 기본 500
  totalRounds: number;          // 라운드 수, 기본 5
  soundEnabled: boolean;
  hapticEnabled: boolean;

  // 혀 운동 (tongue-exercises) — 미설정 시 기본값 사용
  tongueTotalRounds?: number;
  tongueThreshold?: number;       // jawOpen 프록시 임계값, 기본 0.3
  tongueHoldDurationMs?: number;

  // 소리 열기구 (sound-balloon)
  soundBalloonTotalRounds?: number;
  soundBalloonThreshold?: number; // 정규화 볼륨 임계값, 기본 0.3
  soundBalloonHoldMs?: number;

  // 따라 말하기 (follow-speech)
  followSpeechTotalRounds?: number;
  followSpeechThreshold?: number; // 유사도 임계값, 기본 0.6
  followSpeechLevel?: SpeechLevel;
}
