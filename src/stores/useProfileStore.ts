'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChildProfile, TherapistSettings } from '@/types/profile';
import { MOUTH_OPEN_THRESHOLD, LIP_PUCKER_THRESHOLD, HOLD_DURATION_MS, DEFAULT_TOTAL_ROUNDS } from '@/constants/thresholds';

interface ProfileStore {
  child: ChildProfile | null;
  settings: TherapistSettings;

  setChild: (profile: ChildProfile) => void;
  updateSettings: (partial: Partial<TherapistSettings>) => void;
  reset: () => void;
}

const defaultSettings: TherapistSettings = {
  mouthOpenThreshold: MOUTH_OPEN_THRESHOLD,
  lipPuckerThreshold: LIP_PUCKER_THRESHOLD,
  holdDurationMs: HOLD_DURATION_MS,
  totalRounds: DEFAULT_TOTAL_ROUNDS,
  soundEnabled: true,
  hapticEnabled: true,
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      child: null,
      settings: defaultSettings,

      setChild: (profile) => set({ child: profile }),

      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      reset: () =>
        set({
          child: null,
          settings: defaultSettings,
        }),
    }),
    {
      name: 'speech-therapy-profile',
      skipHydration: true,
    }
  )
);
