'use client';

import { cn } from '@/utils/cn';

interface GaugeOverlayProps {
  value: number;       // 0~1 현재 값
  threshold: number;   // 0~1 목표 임계값
  className?: string;
}

export function GaugeOverlay({ value, threshold, className }: GaugeOverlayProps) {
  const percent = Math.min(100, Math.max(0, value * 100));
  const thresholdPercent = threshold * 100;
  const isAbove = value >= threshold;

  return (
    <div className={cn('w-full relative', className)}>
      {/* 게이지 바 */}
      <div className="w-full h-8 bg-gray-200/60 rounded-full overflow-hidden relative backdrop-blur-sm">
        {/* 목표 라인 */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gray-600 z-10"
          style={{ left: `${thresholdPercent}%` }}
        />
        {/* 현재 값 바 */}
        <div
          className={cn(
            'h-full rounded-full gauge-transition',
            isAbove ? 'bg-success' : 'bg-reward'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {/* 라벨 */}
      <div className="flex justify-between mt-1 text-xs text-white/80">
        <span>0%</span>
        <span className={cn(isAbove ? 'text-green-300 font-bold' : 'text-white/80')}>
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  );
}
