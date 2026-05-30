'use client';

import { useCallback, useRef, useState } from 'react';
import { useSessionStore } from '@/stores/useSessionStore';
import { useReward } from './useReward';
import { useSound } from '@/hooks/useSound';
import type { GameId, GamePhase, RoundResult, RoundType, GameResult } from '@/types/game';

interface UseGameSessionOptions {
  gameId: GameId;
  totalRounds: number;
}

export function useGameSession({ gameId, totalRounds }: UseGameSessionOptions) {
  const store = useSessionStore();
  const { applyReward } = useReward();
  const { play, playFanfare } = useSound();
  const [countdownValue, setCountdownValue] = useState(3);
  const peakValueRef = useRef(0);

  const startGame = useCallback(() => {
    store.startSession(gameId, totalRounds);
    peakValueRef.current = 0;

    // 3-2-1 countdown
    setCountdownValue(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownValue(count);
        play('countdown');
      } else {
        clearInterval(interval);
        store.setPhase('playing');
      }
    }, 1000);
  }, [gameId, totalRounds, store, play]);

  const trackPeak = useCallback((value: number) => {
    if (value > peakValueRef.current) {
      peakValueRef.current = value;
    }
  }, []);

  const completeRound = useCallback(
    (success: boolean, peakValue: number, holdDurationMs: number, roundType: RoundType = 'open') => {
      const result: RoundResult = {
        roundNumber: store.currentRound,
        roundType,
        success,
        peakValue,
        holdDurationMs,
        timestamp: Date.now(),
      };

      store.addRoundResult(result);

      if (success) {
        play('success');
        store.setPhase('round-success');
      } else {
        store.setPhase('round-fail');
      }

      // After short delay, proceed
      setTimeout(() => {
        if (store.currentRound >= totalRounds) {
          finishGame();
        } else {
          store.nextRound();
          store.setPhase('playing');
        }
      }, 1500);
    },
    [store, totalRounds, play]
  );

  const finishGame = useCallback(() => {
    store.setPhase('finished');
    const result = store.getResult();
    if (result) {
      applyReward(result);
      playFanfare();
    }
  }, [store, applyReward, playFanfare]);

  const pauseGame = useCallback(() => {
    store.setPhase('paused');
  }, [store]);

  const resumeGame = useCallback(() => {
    store.setPhase('playing');
  }, [store]);

  const getResult = useCallback((): GameResult | null => {
    return store.getResult();
  }, [store]);

  return {
    phase: store.phase,
    currentRound: store.currentRound,
    totalRounds: store.totalRounds,
    countdownValue,
    startGame,
    trackPeak,
    completeRound,
    pauseGame,
    resumeGame,
    getResult,
    reset: store.reset,
  };
}
