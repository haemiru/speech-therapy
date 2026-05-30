'use client';

import { cn } from '@/utils/cn';

interface StarDisplayProps {
  count: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export function StarDisplay({
  count,
  max = 5,
  size = 'md',
  animated = true,
  className,
}: StarDisplayProps) {
  return (
    <div className={cn('flex gap-1 items-center', className)}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={cn(
            sizeMap[size],
            i < count
              ? animated
                ? 'animate-pop'
                : ''
              : 'opacity-30 grayscale'
          )}
          style={animated && i < count ? { animationDelay: `${i * 100}ms` } : undefined}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}
