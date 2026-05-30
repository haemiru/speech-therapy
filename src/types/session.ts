import type { GameId, GameResult } from './game';

export interface SessionRecord {
  id: string;
  gameId: GameId;
  result: GameResult;
  date: string;        // YYYY-MM-DD
  timestamp: number;
}

export interface DailyActivity {
  date: string;        // YYYY-MM-DD
  sessionsPlayed: number;
  starsEarned: number;
  gameIds: GameId[];
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastPlayDate: string | null;
}
