'use client';

import { BackButton } from '@/components/ui/BackButton';
import { PuppyAvatar } from '@/components/puppy/PuppyAvatar';
import { GrowthProgress } from '@/components/puppy/GrowthProgress';
import { usePuppyStore } from '@/stores/usePuppyStore';
import { PUPPY_STAGES, getNextStage } from '@/constants/puppy';

export default function PuppyPage() {
  const { totalStars, currentStage, name } = usePuppyStore();
  const stageDef = PUPPY_STAGES.find((s) => s.stage === currentStage) ?? PUPPY_STAGES[0];
  const nextStage = getNextStage(currentStage);

  return (
    <div className="flex-1 flex flex-col p-4 safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton href="/home" />
        <h1 className="text-xl font-bold text-gray-700">내 강아지</h1>
      </div>

      {/* Puppy Display */}
      <div className="flex flex-col items-center py-8 bg-white rounded-3xl shadow-lg mb-6">
        <PuppyAvatar stage={currentStage} size="xl" />
        <h2 className="text-2xl font-bold text-gray-700 mt-4">{name}</h2>
        <p className="text-gray-500 mt-1">{stageDef.name} {stageDef.emoji}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-2xl">⭐</span>
          <span className="text-3xl font-bold text-reward">{totalStars}</span>
        </div>
        {nextStage && (
          <p className="text-sm text-gray-400 mt-2">
            다음 진화까지 {nextStage.requiredStars - totalStars}⭐ 더 모으자!
          </p>
        )}
        {!nextStage && (
          <p className="text-sm text-reward mt-2 font-bold">
            최고 단계 달성! 🎉
          </p>
        )}
      </div>

      {/* Speech bubble */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-6 relative">
        <div className="absolute -top-2 left-8 w-4 h-4 bg-white rotate-45 shadow-md" />
        <p className="text-gray-600 text-center relative z-10">
          {currentStage === 1 && '알 안에서 꿈틀꿈틀! 곧 태어날 거야!'}
          {currentStage === 2 && '왈왈! 놀아줘서 고마워! 🐾'}
          {currentStage === 3 && '같이 뛰어놀자! 꼬리가 저절로 흔들려! 🐾'}
          {currentStage === 4 && '우리 정말 좋은 친구야! 더 강해지고 싶어!'}
          {currentStage === 5 && '최고의 영웅이 됐어! 함께해서 행복해! 👑'}
        </p>
      </div>

      {/* Growth Timeline */}
      <div className="bg-white rounded-3xl shadow-lg p-4 flex-1 overflow-y-auto">
        <GrowthProgress
          currentStage={currentStage}
          totalStars={totalStars}
        />
      </div>
    </div>
  );
}
