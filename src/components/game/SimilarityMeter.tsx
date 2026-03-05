'use client';

import { cn } from '@/utils/cn';

interface SimilarityMeterProps {
  value: number;   // 0~1
  threshold: number;
  className?: string;
}

function getBarColor(value: number): string {
  if (value >= 0.8) return 'bg-green-500';
  if (value >= 0.5) return 'bg-orange-400';
  return 'bg-red-400';
}

export function SimilarityMeter({ value, threshold, className }: SimilarityMeterProps) {
  const percent = Math.round(value * 100);
  const thresholdPercent = Math.round(threshold * 100);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-500 font-medium">정확도</span>
        <span className={cn(
          'font-bold text-lg',
          value >= threshold ? 'text-green-500' : 'text-gray-600',
        )}>
          {percent}%
        </span>
      </div>

      {/* 바 컨테이너 */}
      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        {/* 채워진 바 */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            getBarColor(value),
          )}
          style={{ width: `${percent}%` }}
        />

        {/* 임계값 마커 */}
        <div
          className="absolute top-0 h-full w-0.5 bg-gray-500"
          style={{ left: `${thresholdPercent}%` }}
        />
      </div>

      {/* 임계값 라벨 */}
      <div className="relative mt-0.5">
        <span
          className="absolute text-[10px] text-gray-400 -translate-x-1/2"
          style={{ left: `${thresholdPercent}%` }}
        >
          목표 {thresholdPercent}%
        </span>
      </div>
    </div>
  );
}
