'use client';

import { cn } from '@/utils/cn';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  locked?: boolean;
}

export function Card({
  interactive = false,
  locked = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-lg p-4 relative',
        interactive && !locked && 'cursor-pointer hover:scale-105 active:scale-95 transition-transform',
        locked && 'opacity-60',
        className
      )}
      {...props}
    >
      {children}
      {locked && (
        <div className="absolute inset-0 bg-white/40 rounded-2xl flex items-center justify-center">
          <span className="text-3xl">🔒</span>
        </div>
      )}
    </div>
  );
}
