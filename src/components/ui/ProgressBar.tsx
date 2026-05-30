'use client';

import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number; // 0~1
  max?: number;
  color?: 'blue' | 'green' | 'yellow' | 'orange';
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const colorMap = {
  blue: 'bg-progress',
  green: 'bg-success',
  yellow: 'bg-reward',
  orange: 'bg-warning',
};

const heightMap = {
  sm: 'h-1.5',
  md: 'h-3',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 1,
  color = 'blue',
  height = 'md',
  animated = true,
  className,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        heightMap[height],
        className
      )}
    >
      <div
        className={cn(
          'h-full rounded-full',
          colorMap[color],
          animated && 'transition-all duration-300 ease-out'
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
