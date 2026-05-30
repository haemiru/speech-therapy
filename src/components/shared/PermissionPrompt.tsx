'use client';

import { Button } from '@/components/ui/Button';
import type { CameraStatus } from '@/hooks/useCamera';

interface PermissionPromptProps {
  status: CameraStatus;
  error: string | null;
  onRequestPermission: () => void;
}

export function PermissionPrompt({
  status,
  error,
  onRequestPermission,
}: PermissionPromptProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      {/* Character illustration */}
      <div className="text-8xl mb-6 animate-wave">📷</div>

      {/* Child-facing text */}
      <h2 className="text-2xl font-bold text-gray-700 mb-2">
        카메라를 켜서
        <br />
        내 얼굴을 보여줘!
      </h2>

      {/* Parent-facing text */}
      <p className="text-sm text-gray-400 mt-4 mb-8 max-w-xs">
        부모님께: 카메라로 아이의 입 움직임을 인식합니다.
        <br />
        영상은 저장되지 않습니다.
      </p>

      {/* Error message */}
      {(status === 'denied' || status === 'error') && error && (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-6 text-sm max-w-xs">
          {error}
        </div>
      )}

      {/* Action button */}
      <Button
        size="lg"
        fullWidth
        onClick={onRequestPermission}
        disabled={status === 'requesting'}
        className="max-w-xs"
      >
        {status === 'requesting' ? (
          '카메라 연결 중...'
        ) : status === 'denied' ? (
          '다시 시도하기'
        ) : (
          '📷 카메라 켜기!'
        )}
      </Button>
    </div>
  );
}
