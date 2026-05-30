'use client';

import { useCallback } from 'react';
import { usePuppyStore } from '@/stores/usePuppyStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import type { GameResult } from '@/types/game';
import { STAR_THRESHOLDS, BONUS_PEAK_THRESHOLD } from '@/constants/thresholds';

export function useReward() {
  const addStars = usePuppyStore((s) => s.addStars);
  const addRecord = useHistoryStore((s) => s.addRecord);

  const calculateStars = useCallback(
    (successCount: number, totalRounds: number, peakValue: number): number => {
      const rate = successCount / totalRounds;
      let stars = 0;
      if (rate >= STAR_THRESHOLDS.three) stars = 3;
      else if (rate >= STAR_THRESHOLDS.two) stars = 2;
      else if (successCount > 0) stars = 1;

      if (peakValue >= BONUS_PEAK_THRESHOLD) stars += 1;
      return stars;
    },
    []
  );

  const applyReward = useCallback(
    (result: GameResult) => {
      if (result.starsEarned > 0) {
        addStars(result.starsEarned);
      }
      addRecord(result);
    },
    [addStars, addRecord]
  );

  return { calculateStars, applyReward };
}
