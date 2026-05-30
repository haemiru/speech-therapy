'use client';

import { BackButton } from '@/components/ui/BackButton';
import { PauseButton } from '@/components/ui/PauseButton';

interface GameHeaderProps {
  title: string;
  onBack: () => void;
  onPause: () => void;
}

export function GameHeader({ title, onBack, onPause }: GameHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3">
      <BackButton href="/home" />
      <h1 className="text-lg font-bold text-gray-700">{title}</h1>
      <PauseButton onPause={onPause} />
    </div>
  );
}
