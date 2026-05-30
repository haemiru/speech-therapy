'use client';

import { useRouter } from 'next/navigation';
import { PuppyWidget } from '@/components/puppy/PuppyWidget';
import { Card } from '@/components/ui/Card';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { GAMES } from '@/constants/games';

export default function HomePage() {
  const router = useRouter();
  const { streak } = useHistoryStore();

  return (
    <div className="flex-1 flex flex-col p-4 safe-bottom">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold text-gray-700">소리야 놀자!</h1>
        {streak.currentStreak > 0 && (
          <p className="text-sm text-warning mt-1">
            🔥 {streak.currentStreak}일 연속 참여 중!
          </p>
        )}
      </div>

      {/* Puppy Widget */}
      <div className="mb-6">
        <PuppyWidget />
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {GAMES.map((game) => {
          const isLocked = game.status === 'locked';
          return (
            <Card
              key={game.id}
              interactive
              locked={isLocked}
              className="flex flex-col items-center justify-center min-h-[140px] gap-2"
              onClick={() => {
                if (!isLocked) {
                  router.push(game.route);
                }
              }}
            >
              <span className="text-5xl">{game.icon}</span>
              <span className="text-sm font-bold text-gray-700 text-center">
                {game.name}
              </span>
            </Card>
          );
        })}
      </div>

      {/* Bottom nav */}
      <div className="flex justify-between items-center pt-4 px-2">
        <button
          className="flex flex-col items-center gap-1 text-gray-400 active:text-gray-600 touch-target"
          aria-label="설정"
          onClick={() => router.push('/settings')}
        >
          <span className="text-2xl">⚙️</span>
          <span className="text-xs">설정</span>
        </button>
        <button
          className="flex flex-col items-center gap-1 text-gray-400 active:text-gray-600 touch-target"
          aria-label="프로필"
        >
          <span className="text-2xl">👤</span>
          <span className="text-xs">프로필</span>
        </button>
      </div>
    </div>
  );
}
