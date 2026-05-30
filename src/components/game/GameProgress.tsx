'use client';

import { StarDisplay } from '@/components/ui/StarDisplay';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface GameProgressProps {
  currentRound: number;
  totalRounds: number;
  successCount: number;
}

export function GameProgress({ currentRound, totalRounds, successCount }: GameProgressProps) {
  return (
    <div className="bg-white/60 rounded-xl p-3 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 font-medium">
          진행: {currentRound}/{totalRounds}
        </span>
        <StarDisplay count={successCount} max={totalRounds} size="sm" animated={false} />
      </div>
      <ProgressBar
        value={currentRound - 1}
        max={totalRounds}
        color="blue"
        height="sm"
      />
    </div>
  );
}
