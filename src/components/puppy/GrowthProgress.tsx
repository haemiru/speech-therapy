'use client';

import Image from 'next/image';
import { cn } from '@/utils/cn';
import { PUPPY_STAGES } from '@/constants/puppy';
import type { PuppyStage } from '@/types/puppy';

interface GrowthProgressProps {
  currentStage: PuppyStage;
  totalStars: number;
  className?: string;
}

/** 타임라인 노드 크기 (단계별) */
const nodeSizes: Record<number, number> = {
  1: 24,
  2: 28,
  3: 32,
  4: 36,
  5: 40,
};

export function GrowthProgress({ currentStage, totalStars, className }: GrowthProgressProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="font-bold text-gray-700 text-lg">성장 타임라인</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {PUPPY_STAGES.map((stage) => {
          const reached = totalStars >= stage.requiredStars;
          const isCurrent = stage.stage === currentStage;
          const imgSize = nodeSizes[stage.stage] ?? 32;

          return (
            <div key={stage.stage} className="relative flex items-center gap-4 py-3">
              {/* Node */}
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center z-10',
                  reached
                    ? 'bg-yellow-100 shadow-md'
                    : 'bg-gray-100',
                  isCurrent && 'ring-2 ring-reward ring-offset-2 animate-pulse-ring'
                )}
              >
                <Image
                  src="/assets/puppy/mungchi.webp"
                  alt={stage.name}
                  width={imgSize}
                  height={imgSize}
                  className={cn(
                    'object-contain',
                    !reached && 'opacity-30 grayscale'
                  )}
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'font-bold',
                      reached ? 'text-gray-700' : 'text-gray-400'
                    )}
                  >
                    {stage.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {stage.requiredStars}⭐
                  </span>
                  {isCurrent && (
                    <span className="text-xs bg-reward text-white px-2 py-0.5 rounded-full font-bold">
                      지금!
                    </span>
                  )}
                </div>
                <p className={cn(
                  'text-sm mt-0.5',
                  reached ? 'text-gray-500' : 'text-gray-300'
                )}>
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
