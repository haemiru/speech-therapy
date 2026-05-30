'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionRecord, DailyActivity, StreakInfo } from '@/types/session';
import type { GameResult } from '@/types/game';

interface HistoryStore {
  records: SessionRecord[];
  streak: StreakInfo;

  addRecord: (result: GameResult) => void;
  getRecordsByDate: (date: string) => SessionRecord[];
  getDailyActivities: (days: number) => DailyActivity[];
  reset: () => void;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function calcStreak(records: SessionRecord[], lastPlayDate: string | null): StreakInfo {
  if (records.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastPlayDate: null };
  }

  const dates = [...new Set(records.map((r) => r.date))].sort().reverse();
  const today = getToday();

  let currentStreak = 0;
  let checkDate = today;

  for (const date of dates) {
    if (date === checkDate) {
      currentStreak++;
      // 전날로 이동
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().slice(0, 10);
    } else if (date < checkDate) {
      break;
    }
  }

  // 오늘 아직 안 했으면 어제부터 체크
  if (currentStreak === 0 && dates[0] !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    checkDate = yesterday.toISOString().slice(0, 10);
    for (const date of dates) {
      if (date === checkDate) {
        currentStreak++;
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = d.toISOString().slice(0, 10);
      } else if (date < checkDate) {
        break;
      }
    }
  }

  // longestStreak 계산
  let longest = 0;
  let streak = 0;
  let prev = '';
  for (const date of [...new Set(records.map((r) => r.date))].sort()) {
    if (prev) {
      const prevDate = new Date(prev);
      prevDate.setDate(prevDate.getDate() + 1);
      if (prevDate.toISOString().slice(0, 10) === date) {
        streak++;
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }
    longest = Math.max(longest, streak);
    prev = date;
  }

  return {
    currentStreak,
    longestStreak: Math.max(longest, currentStreak),
    lastPlayDate: lastPlayDate ?? dates[0] ?? null,
  };
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      records: [],
      streak: { currentStreak: 0, longestStreak: 0, lastPlayDate: null },

      addRecord: (result: GameResult) => {
        const today = getToday();
        const record: SessionRecord = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          gameId: result.gameId,
          result,
          date: today,
          timestamp: Date.now(),
        };
        set((state) => {
          const records = [...state.records, record];
          const streak = calcStreak(records, today);
          return { records, streak };
        });
      },

      getRecordsByDate: (date: string) => {
        return get().records.filter((r) => r.date === date);
      },

      getDailyActivities: (days: number) => {
        const activities: DailyActivity[] = [];
        const today = new Date();
        for (let i = 0; i < days; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().slice(0, 10);
          const dayRecords = get().records.filter((r) => r.date === dateStr);
          activities.push({
            date: dateStr,
            sessionsPlayed: dayRecords.length,
            starsEarned: dayRecords.reduce(
              (sum, r) => sum + r.result.starsEarned,
              0
            ),
            gameIds: [...new Set(dayRecords.map((r) => r.gameId))],
          });
        }
        return activities;
      },

      reset: () =>
        set({
          records: [],
          streak: { currentStreak: 0, longestStreak: 0, lastPlayDate: null },
        }),
    }),
    {
      name: 'speech-therapy-history',
      skipHydration: true,
    }
  )
);
