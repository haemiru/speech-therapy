'use client';

import { cn } from '@/utils/cn';

interface VolumeMeterProps {
  value: number;      // 0~1 current volume
  threshold: number;  // 0~1 threshold line
  className?: string;
}

export function VolumeMeter({ value, threshold, className }: VolumeMeterProps) {
  const percent = Math.min(100, Math.max(0, value * 100));
  const thresholdPercent = threshold * 100;
  const isAbove = value >= threshold;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-2">
        <span className="text-xl">🎤</span>
        <div className="flex-1 relative">
          {/* Bar background */}
          <div className="w-full h-6 bg-gray-200/60 rounded-full overflow-hidden relative backdrop-blur-sm">
            {/* Threshold line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gray-600 z-10"
              style={{ left: `${thresholdPercent}%` }}
            />
            {/* Current volume bar */}
            <div
              className={cn(
                'h-full rounded-full transition-all duration-100',
                isAbove ? 'bg-orange-400' : 'bg-orange-200'
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          {/* Labels */}
          <div className="flex justify-between mt-0.5 text-[10px] text-gray-400">
            <span>조용</span>
            <span className={cn(isAbove ? 'text-orange-500 font-bold' : '')}>
              {Math.round(percent)}%
            </span>
            <span>크게</span>
          </div>
        </div>
      </div>
    </div>
  );
}
