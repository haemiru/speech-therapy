'use client';

import Image from 'next/image';
import { cn } from '@/utils/cn';
import type { PuppyStage } from '@/types/puppy';

interface PuppyAvatarProps {
  stage: PuppyStage;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

/** 단계별 이미지 크기 (px) */
const imgSizeMap: Record<PuppyStage, Record<'sm' | 'md' | 'lg' | 'xl', number>> = {
  1: { sm: 32, md: 44, lg: 64, xl: 80 },
  2: { sm: 40, md: 56, lg: 80, xl: 104 },
  3: { sm: 48, md: 68, lg: 100, xl: 130 },
  4: { sm: 52, md: 76, lg: 112, xl: 150 },
  5: { sm: 56, md: 84, lg: 124, xl: 170 },
};

/** 단계별 원형 배경 크기 */
const bgSizeMap: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'w-14 h-14',
  md: 'w-20 h-20',
  lg: 'w-28 h-28',
  xl: 'w-36 h-36',
};

/** 단계별 스타일 설정 */
const stageConfig: Record<PuppyStage, {
  bg: string;
  ring: string;
  badge: string | null;
  badgePos: string;
  imgStyle: string;
  extraEmoji: string | null;
}> = {
  1: {
    bg: 'bg-white',
    ring: 'ring-2 ring-pink-200',
    badge: '💤',
    badgePos: 'absolute -top-1 -right-1 text-lg',
    imgStyle: 'opacity-80 saturate-[0.6]',
    extraEmoji: null,
  },
  2: {
    bg: 'bg-white',
    ring: 'ring-2 ring-green-300',
    badge: '🌱',
    badgePos: 'absolute -top-1 -right-0 text-lg',
    imgStyle: 'opacity-90',
    extraEmoji: null,
  },
  3: {
    bg: 'bg-white',
    ring: 'ring-3 ring-blue-400',
    badge: '⚡',
    badgePos: 'absolute -top-1 -right-1 text-xl',
    imgStyle: '',
    extraEmoji: null,
  },
  4: {
    bg: 'bg-white',
    ring: 'ring-3 ring-purple-400 shadow-lg shadow-purple-200',
    badge: '⭐',
    badgePos: 'absolute -top-2 -right-2 text-xl',
    imgStyle: '',
    extraEmoji: '💜',
  },
  5: {
    bg: 'bg-white',
    ring: 'ring-4 ring-yellow-400 shadow-xl shadow-yellow-300',
    badge: '👑',
    badgePos: 'absolute -top-3 left-1/2 -translate-x-1/2 text-2xl',
    imgStyle: '',
    extraEmoji: null,
  },
};

export function PuppyAvatar({
  stage,
  size = 'md',
  animated = true,
  className,
}: PuppyAvatarProps) {
  const imgPx = imgSizeMap[stage]?.[size] ?? imgSizeMap[3][size];
  const config = stageConfig[stage] ?? stageConfig[1];

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        animated && 'animate-float',
        className
      )}
    >
      {/* 원형 배경 */}
      <div
        className={cn(
          'rounded-full flex items-center justify-center',
          bgSizeMap[size],
          config.bg,
          config.ring,
        )}
      >
        <Image
          src="/assets/puppy/mungchi.webp"
          alt="뭉치"
          width={imgPx}
          height={imgPx}
          className={cn('object-contain', config.imgStyle)}
          priority
        />
      </div>

      {/* 배지 */}
      {config.badge && (
        <span className={config.badgePos}>{config.badge}</span>
      )}

      {/* 4단계: 하트 */}
      {config.extraEmoji && (
        <span className="absolute -bottom-1 -left-1 text-lg">{config.extraEmoji}</span>
      )}

      {/* 5단계: 양쪽 반짝임 */}
      {stage === 5 && (
        <>
          <span className="absolute -left-2 top-1/2 -translate-y-1/2 text-lg animate-sparkle">✨</span>
          <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-lg animate-sparkle" style={{ animationDelay: '0.5s' }}>✨</span>
        </>
      )}
    </div>
  );
}
