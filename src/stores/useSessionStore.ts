'use client';

import { create } from 'zustand';
import type { GameId, GamePhase, RoundResult, GameResult } from '@/types/game';

interface SessionStore {
  gameId: GameId | null;
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  rounds: RoundResult[];
  startTime: number | null;
  currentValue: number;    // 실시간 센서 값

  startSession: (gameId: GameId, totalRounds: number) => void;
  setPhase: (phase: GamePhase) => void;
  setCurrentValue: (value: number) => void;
  addRoundResult: (result: RoundResult) => void;
  nextRound: () => void;
  getResult: () => GameResult | null;
  reset: () => void;
}

export const useSessionStore = create<SessionStore>()((set, get) => ({
  gameId: null,
  phase: 'ready',
  currentRound: 1,
  totalRounds: 5,
  rounds: [],
  startTime: null,
  currentValue: 0,

  startSession: (gameId, totalRounds) =>
    set({
      gameId,
      phase: 'countdown',
      currentRound: 1,
      totalRounds,
      rounds: [],
      startTime: Date.now(),
      currentValue: 0,
    }),

  setPhase: (phase) => set({ phase }),

  setCurrentValue: (value) => set({ currentValue: value }),

  addRoundResult: (result) =>
    set((state) => ({ rounds: [...state.rounds, result] })),

  nextRound: () =>
    set((state) => ({
      currentRound: state.currentRound + 1,
      currentValue: 0,
    })),

  getResult: () => {
    const state = get();
    if (!state.gameId || !state.startTime) return null;

    const successCount = state.rounds.filter((r) => r.success).length;
    const peakValue = Math.max(0, ...state.rounds.map((r) => r.peakValue));

    let starsEarned = 0;
    const successRate = successCount / state.totalRounds;
    if (successRate >= 0.8) starsEarned = 3;
    else if (successRate >= 0.6) starsEarned = 2;
    else if (successCount > 0) starsEarned = 1;

    // 보너스 별: 최고값 90% 이상
    if (peakValue >= 0.9) starsEarned += 1;

    return {
      gameId: state.gameId,
      totalRounds: state.totalRounds,
      successCount,
      starsEarned,
      rounds: state.rounds,
      totalDurationMs: Date.now() - state.startTime,
      peakValue,
      completedAt: Date.now(),
    };
  },

  reset: () =>
    set({
      gameId: null,
      phase: 'ready',
      currentRound: 1,
      totalRounds: 5,
      rounds: [],
      startTime: null,
      currentValue: 0,
    }),
}));
