'use client';

import { useRouter } from 'next/navigation';
import { usePuppyStore } from '@/stores/usePuppyStore';
import { PuppyAvatar } from './PuppyAvatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PUPPY_STAGES, getNextStage } from '@/constants/puppy';

export function PuppyWidget() {
  const router = useRouter();
  const { totalStars, currentStage, name } = usePuppyStore();
  const stageDef = PUPPY_STAGES.find((s) => s.stage === currentStage) ?? PUPPY_STAGES[0];
  const nextStage = getNextStage(currentStage);

  const progressToNext = nextStage
    ? (totalStars - stageDef.requiredStars) / (nextStage.requiredStars - stageDef.requiredStars)
    : 1;

  return (
    <button
      onClick={() => router.push('/puppy')}
      className="w-full bg-white rounded-3xl shadow-lg p-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
    >
      <PuppyAvatar stage={currentStage} size="md" />
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-700 truncate">{name}</span>
          <span className="text-sm text-gray-400">{stageDef.name}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm">⭐ {totalStars}</span>
          {nextStage && (
            <span className="text-xs text-gray-400">
              → {nextStage.name} {nextStage.requiredStars}⭐
            </span>
          )}
        </div>
        <ProgressBar
          value={progressToNext}
          color="yellow"
          height="sm"
          className="mt-2"
        />
      </div>
      <span className="text-gray-300 text-xl">›</span>
    </button>
  );
}
