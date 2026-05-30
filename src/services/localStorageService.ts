/**
 * Phase 1: localStorage 기반 데이터 서비스
 * Phase 2에서 Supabase로 교체 예정
 */
export const localStorageService = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage quota exceeded
      console.warn('localStorage set failed for key:', key);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    // Only clear speech-therapy keys
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith('speech-therapy-')
    );
    keys.forEach((k) => localStorage.removeItem(k));
  },
};
