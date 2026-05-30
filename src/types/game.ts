export type GameId = 'mouth-opening' | 'tongue-exercises' | 'sound-balloon' | 'follow-speech' | 'my-records' | 'report';

export type GameStatus = 'locked' | 'available' | 'completed';

/** 라운드 유형: 입 벌리기, 입 오므리기, 혀 운동, 발성 유지, 따라 말하기 */
export type RoundType = 'open' | 'pucker' | 'tongue-out' | 'tongue-up' | 'tongue-left' | 'tongue-right' | 'sustain' | 'follow-speech';

export interface GameConfig {
  id: GameId;
  name: string;
  description: string;
  icon: string;
  route: string;
  status: GameStatus;
  totalRounds: number;
  roundDurationSec: number;
  restBetweenRoundsSec: number;
}

export type GamePhase =
  | 'ready'       // 준비 화면
  | 'waiting'     // 문제 제시/TTS 재생 후 사용자 입력 대기 (따라 말하기)
  | 'countdown'   // 3-2-1 카운트다운
  | 'playing'     // 진행 중
  | 'round-success' // 라운드 성공
  | 'round-fail'    // 라운드 시간 초과
  | 'resting'     // 라운드 간 휴식
  | 'paused'      // 일시정지
  | 'finished';   // 모든 라운드 완료

export interface RoundResult {
  roundNumber: number;
  roundType: RoundType;   // 벌리기 or 오므리기
  success: boolean;
  peakValue: number;      // 최고 도달값 (0~1)
  holdDurationMs: number; // 목표 도달 유지 시간
  timestamp: number;
}

export interface GameResult {
  gameId: GameId;
  totalRounds: number;
  successCount: number;
  starsEarned: number;
  rounds: RoundResult[];
  totalDurationMs: number;
  peakValue: number;       // 전체 세션 최고값
  completedAt: number;
}
