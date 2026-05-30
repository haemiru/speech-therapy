'use client';

import { cn } from '@/utils/cn';
import type { RefObject } from 'react';

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  className?: string;
  mirrored?: boolean;
}

export function CameraView({ videoRef, className, mirrored = true }: CameraViewProps) {
  return (
    <div className={cn('relative rounded-2xl overflow-hidden bg-gray-900', className)}>
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={cn(
          'w-full h-full object-cover',
          mirrored && 'scale-x-[-1]'
        )}
      />
    </div>
  );
}
