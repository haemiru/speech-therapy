'use client';

import { cn } from '@/utils/cn';
import type { RoundType } from '@/types/game';

interface TargetDisplayProps {
  message: string;
  isAtTarget: boolean;
  roundType?: RoundType;
  className?: string;
}

const ROUND_TYPE_CONFIG: Record<RoundType, { emoji: string; label: string }> = {
  open: { emoji: '😮', label: '벌려!' },
  pucker: { emoji: '😙', label: '오므려!' },
  'tongue-out': { emoji: '😛', label: '혀 쭉!' },
  'tongue-up': { emoji: '👅', label: '위로!' },
  'tongue-left': { emoji: '👅', label: '왼쪽!' },
  'tongue-right': { emoji: '👅', label: '오른쪽!' },
  sustain: { emoji: '🎤', label: '소리내!' },
  'follow-speech': { emoji: '🗣️', label: '따라해!' },
} as const;

export function TargetDisplay({ message, isAtTarget, roundType = 'open', className }: TargetDisplayProps) {
  const config = ROUND_TYPE_CONFIG[roundType];

  return (
    <div className={cn(
      'text-center py-4 px-6 rounded-2xl transition-all duration-300',
      isAtTarget ? 'bg-green-50' : 'bg-white/60',
      className
    )}>
      <div className={cn(
        'text-5xl mb-1 transition-transform duration-300',
        isAtTarget ? 'scale-110' : ''
      )}>
        {config.emoji}
      </div>
      <div className={cn(
        'text-2xl font-black mb-1 transition-colors',
        roundType === 'open' ? 'text-blue-500' : 'text-pink-500',
        isAtTarget && 'text-success'
      )}>
        {config.label}
      </div>
      <p className={cn(
        'text-base font-bold transition-colors',
        isAtTarget ? 'text-success' : 'text-gray-700'
      )}>
        {message}
      </p>
    </div>
  );
}
