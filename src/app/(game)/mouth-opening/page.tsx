'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { BackButton } from '@/components/ui/BackButton';
import { PermissionPrompt } from '@/components/shared/PermissionPrompt';
import { useCamera } from '@/hooks/useCamera';

export default function MouthOpeningPage() {
  const router = useRouter();
  const { videoRef, status, error, start, stop, isActive } = useCamera();

  const handleRequestPermission = useCallback(async () => {
    await start();
  }, [start]);

  // Camera is active → navigate to play screen
  useEffect(() => {
    if (isActive) {
      stop(); // play screen will create its own camera
      router.replace('/mouth-opening/play');
    }
  }, [isActive, stop, router]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <BackButton href="/home" />
        <h1 className="text-xl font-bold text-gray-700">입 운동 게임</h1>
      </div>

      {/* Permission prompt */}
      <PermissionPrompt
        status={status}
        error={error}
        onRequestPermission={handleRequestPermission}
      />

      {/* Hidden video element for permission check */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="hidden"
      />
    </div>
  );
}
