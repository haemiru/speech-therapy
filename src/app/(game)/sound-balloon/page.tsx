'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { BackButton } from '@/components/ui/BackButton';
import { MicPermissionPrompt } from '@/components/shared/MicPermissionPrompt';

type MicStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

export default function SoundBalloonPage() {
  const router = useRouter();
  const [status, setStatus] = useState<MicStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleRequestPermission = useCallback(async () => {
    setStatus('requesting');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Permission granted, stop the test stream
      stream.getTracks().forEach((track) => track.stop());
      setStatus('granted');
      router.replace('/sound-balloon/play');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setStatus('denied');
        setError('마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크를 허용해주세요.');
      } else {
        setStatus('error');
        setError('마이크 연결에 실패했습니다. 마이크가 연결되어 있는지 확인해주세요.');
      }
    }
  }, [router]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <BackButton href="/home" />
        <h1 className="text-xl font-bold text-gray-700">소리 열기구 게임</h1>
      </div>

      {/* Permission prompt */}
      <MicPermissionPrompt
        status={status}
        error={error}
        onRequestPermission={handleRequestPermission}
      />
    </div>
  );
}
