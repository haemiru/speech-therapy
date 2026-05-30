'use client';

import { cn } from '@/utils/cn';

interface PauseButtonProps {
  onPause: () => void;
  className?: string;
}

export function PauseButton({ onPause, className }: PauseButtonProps) {
  return (
    <button
      onClick={onPause}
      className={cn(
        'w-12 h-12 rounded-full bg-white/80 shadow-md flex items-center justify-center',
        'active:scale-90 transition-transform touch-target',
        className
      )}
      aria-label="일시정지"
    >
      <span className="text-xl">⏸️</span>
    </button>
  );
}
