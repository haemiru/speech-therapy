'use client';

import { useEffect, useState } from 'react';
import { usePuppyStore } from '@/stores/usePuppyStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { useHistoryStore } from '@/stores/useHistoryStore';

/**
 * Zustand persist stores의 SSR hydration을 처리.
 * 모든 persist store를 rehydrate한 후에 children을 렌더링한다.
 */
export function HydrationGuard({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    usePuppyStore.persist.rehydrate();
    useProfileStore.persist.rehydrate();
    useHistoryStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-dvh bg-gradient-to-b from-sky-100 to-sky-200">
        <div className="animate-float text-6xl">🐶</div>
      </div>
    );
  }

  return <>{children}</>;
}
