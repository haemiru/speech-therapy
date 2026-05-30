'use client';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface PauseOverlayProps {
  open: boolean;
  onResume: () => void;
  onQuit: () => void;
}

export function PauseOverlay({ open, onResume, onQuit }: PauseOverlayProps) {
  return (
    <Modal open={open}>
      <div className="text-center">
        <div className="text-5xl mb-4">⏸️</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">일시정지</h2>
        <p className="text-sm text-gray-500 mb-6">잠깐 쉬어갈까?</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onQuit}>
            🏠 그만하기
          </Button>
          <Button fullWidth onClick={onResume}>
            ▶️ 계속하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
