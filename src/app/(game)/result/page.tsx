'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ConfettiEffect } from '@/components/reward/ConfettiEffect';
import { ResultCard } from '@/components/reward/ResultCard';
import { PuppyAvatar } from '@/components/puppy/PuppyAvatar';
import { usePuppyStore } from '@/stores/usePuppyStore';
import type { GameResult } from '@/types/game';

export default function ResultPage() {
  const router = useRouter();
  const { currentStage, totalStars, name } = usePuppyStore();
  const [result, setResult] = useState<GameResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('lastGameResult');
    if (stored) {
      setResult(JSON.parse(stored));
    }

    // Hide confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">결과를 불러올 수 없습니다.</p>
        <Button onClick={() => router.push('/home')} className="mt-4">
          홈으로
        </Button>
      </div>
    );
  }

  const puppyMessage =
    result.starsEarned >= 3
      ? '최고야! 정말 잘했어! 🎉'
      : result.starsEarned >= 2
        ? '대단해! 잘하고 있어! 👏'
        : result.starsEarned >= 1
          ? '좋아! 계속 해보자! 💪'
          : '괜찮아! 다음에 더 잘할 수 있어! 🐾';

  return (
    <div className="flex-1 flex flex-col p-4 safe-bottom relative">
      {/* Confetti */}
      {showConfetti && <ConfettiEffect />}

      {/* Celebration header */}
      <div className="text-center py-6">
        <div className="text-5xl mb-3 animate-bounce-in">🎉</div>
        <h1 className="text-3xl font-bold text-gray-700 mb-1">
          정말 잘했어!
        </h1>
        <p className="text-gray-500">오늘도 열심히 했구나!</p>
      </div>

      {/* Puppy reaction */}
      <div className="flex flex-col items-center mb-6">
        <PuppyAvatar stage={currentStage} size="lg" />
        <div className="bg-white rounded-2xl shadow-md px-6 py-3 mt-3 relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-md" />
          <p className="text-gray-600 font-medium relative z-10 text-center">
            {name}: &quot;{puppyMessage}&quot;
          </p>
        </div>
        {result.starsEarned > 0 && (
          <p className="text-sm text-reward mt-2 font-bold animate-pop">
            +{result.starsEarned}⭐ 획득! (총 {totalStars}⭐)
          </p>
        )}
      </div>

      {/* Result card */}
      <ResultCard result={result} />

      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={() => router.push('/mouth-opening')}
        >
          🔄 한번 더!
        </Button>
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          onClick={() => router.push('/home')}
        >
          🏠 홈으로
        </Button>
      </div>
    </div>
  );
}
