'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReportData } from '@/types/report';

interface ReportStore {
  report: ReportData | null;

  setReport: (report: ReportData) => void;
  clearReport: () => void;
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set) => ({
      report: null,

      setReport: (report: ReportData) => set({ report }),
      clearReport: () => set({ report: null }),
    }),
    {
      name: 'speech-therapy-report',
      skipHydration: true,
    }
  )
);
