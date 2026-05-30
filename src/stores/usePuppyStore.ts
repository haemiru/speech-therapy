'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PuppyStage } from '@/types/puppy';
import { getStageForStars, PUPPY_DEFAULT_NAME } from '@/constants/puppy';

interface PuppyStore {
  totalStars: number;
  currentStage: PuppyStage;
  name: string;
  createdAt: number;
  lastInteraction: number;

  addStars: (count: number) => void;
  setName: (name: string) => void;
  reset: () => void;
}

export const usePuppyStore = create<PuppyStore>()(
  persist(
    (set) => ({
      totalStars: 0,
      currentStage: 1 as PuppyStage,
      name: PUPPY_DEFAULT_NAME,
      createdAt: Date.now(),
      lastInteraction: Date.now(),

      addStars: (count: number) =>
        set((state) => {
          const newTotal = state.totalStars + count;
          const stageDef = getStageForStars(newTotal);
          return {
            totalStars: newTotal,
            currentStage: stageDef.stage,
            lastInteraction: Date.now(),
          };
        }),

      setName: (name: string) => set({ name }),

      reset: () =>
        set({
          totalStars: 0,
          currentStage: 1 as PuppyStage,
          name: PUPPY_DEFAULT_NAME,
          createdAt: Date.now(),
          lastInteraction: Date.now(),
        }),
    }),
    {
      name: 'speech-therapy-puppy',
      skipHydration: true,
      // 기존 '멍멍이' → '뭉치' 자동 마이그레이션
      migrate: (persisted: unknown) => {
        const state = persisted as Record<string, unknown>;
        if (state.name === '멍멍이') {
          state.name = PUPPY_DEFAULT_NAME;
        }
        return state as unknown as PuppyStore;
      },
      version: 1,
    }
  )
);
