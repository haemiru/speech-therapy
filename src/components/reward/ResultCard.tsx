'use client';

import { StarDisplay } from '@/components/ui/StarDisplay';
import { toPercent } from '@/utils/faceGeometry';
import type { GameResult } from '@/types/game';

interface ResultCardProps {
  result: GameResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const minutes = Math.floor(result.totalDurationMs / 60000);
  const seconds = Math.floor((result.totalDurationMs % 60000) / 1000);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up">
      <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">
        오늘의 기록
      </h3>

      <div className="space-y-4">
        {/* Stars earned */}
        <div className="flex items-center justify-between">
          <span className="text-gray-500">획득한 별</span>
          <StarDisplay count={result.starsEarned} max={4} size="md" />
        </div>

        {/* Success count */}
        <div className="flex items-center justify-between">
          <span className="text-gray-500">⭐ 성공</span>
          <span className="text-2xl font-bold text-gray-700">
            {result.successCount}/{result.totalRounds}
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center justify-between">
          <span className="text-gray-500">🕐 시간</span>
          <span className="text-2xl font-bold text-gray-700">
            {minutes}분 {seconds}초
          </span>
        </div>

        {/* Peak value */}
        <div className="flex items-center justify-between">
          <span className="text-gray-500">📈 최고 벌림</span>
          <span className="text-2xl font-bold text-gray-700">
            {toPercent(result.peakValue)}
          </span>
        </div>
      </div>
    </div>
  );
}
