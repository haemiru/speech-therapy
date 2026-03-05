'use client';

import { cn } from '@/utils/cn';

interface BalloonSceneProps {
  height: number; // 0~1, balloon height
  isVocalizing: boolean;
  className?: string;
}

export function BalloonScene({ height, isVocalizing, className }: BalloonSceneProps) {
  // Map height 0~1 to translateY: 0% means bottom, 100% means top
  // We invert: higher height → higher position (lower translateY)
  const translateY = (1 - height) * 100;

  // Cloud positions (percentage from top)
  const clouds = [
    { top: '10%', left: '5%', size: 'text-4xl', delay: '0s' },
    { top: '40%', left: '75%', size: 'text-3xl', delay: '1s' },
    { top: '70%', left: '15%', size: 'text-2xl', delay: '2s' },
  ];

  // Check if balloon is near a cloud (within 15% height)
  const balloonTop = (1 - height) * 100;

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden rounded-2xl',
        className
      )}
      style={{
        background: 'linear-gradient(to bottom, #87CEEB 0%, #B0E0E6 40%, #E0F7FA 100%)',
      }}
    >
      {/* Clouds */}
      {clouds.map((cloud, i) => {
        const cloudTop = parseFloat(cloud.top);
        const nearBalloon = Math.abs(cloudTop - balloonTop) < 15 && isVocalizing;
        return (
          <div
            key={i}
            className={cn(
              'absolute transition-all duration-500',
              cloud.size,
              nearBalloon && 'scale-110 brightness-110'
            )}
            style={{
              top: cloud.top,
              left: cloud.left,
              animationDelay: cloud.delay,
            }}
          >
            {nearBalloon ? '✨' : '☁️'}
          </div>
        );
      })}

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-gradient-to-t from-green-300 to-green-200 rounded-b-2xl" />

      {/* Balloon + Basket container */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center transition-transform duration-150 ease-out"
        style={{
          bottom: '8%',
          transform: `translateX(-50%) translateY(-${height * 75}%)`,
        }}
      >
        {/* Balloon */}
        <div
          className={cn(
            'text-7xl transition-transform duration-300',
            isVocalizing && 'animate-pulse scale-110'
          )}
        >
          🎈
        </div>
        {/* Rope */}
        <div className="w-0.5 h-4 bg-gray-400" />
        {/* Basket */}
        <div className="text-2xl">🧺</div>
      </div>

      {/* Height indicator on the right */}
      <div className="absolute right-2 top-4 bottom-16 w-2 bg-white/30 rounded-full overflow-hidden">
        <div
          className="absolute bottom-0 w-full bg-orange-400/70 rounded-full transition-all duration-150"
          style={{ height: `${height * 100}%` }}
        />
      </div>
    </div>
  );
}
