import type { PuppyStageDef } from '@/types/puppy';

export const PUPPY_STAGES: PuppyStageDef[] = [
  {
    stage: 1,
    name: '아기 뭉치',
    emoji: '🐾',
    requiredStars: 0,
    description: '작은 발자국! 이제 시작이야!',
  },
  {
    stage: 2,
    name: '꼬마 뭉치',
    emoji: '🐶',
    requiredStars: 5,
    description: '눈을 반짝이며 놀고 싶어해요!',
  },
  {
    stage: 3,
    name: '씩씩 뭉치',
    emoji: '🐕',
    requiredStars: 15,
    description: '꼬리를 흔들며 뛰어놀아요!',
  },
  {
    stage: 4,
    name: '친구 뭉치',
    emoji: '🐕',
    requiredStars: 30,
    description: '씩씩하고 멋진 친구가 됐어요!',
  },
  {
    stage: 5,
    name: '영웅 뭉치',
    emoji: '🦮',
    requiredStars: 50,
    description: '최고의 영웅 강아지! 👑',
  },
];

export const PUPPY_DEFAULT_NAME = '뭉치';

export function getStageForStars(totalStars: number): PuppyStageDef {
  for (let i = PUPPY_STAGES.length - 1; i >= 0; i--) {
    if (totalStars >= PUPPY_STAGES[i].requiredStars) {
      return PUPPY_STAGES[i];
    }
  }
  return PUPPY_STAGES[0];
}

export function getNextStage(currentStage: number): PuppyStageDef | null {
  const idx = PUPPY_STAGES.findIndex((s) => s.stage === currentStage);
  if (idx < PUPPY_STAGES.length - 1) {
    return PUPPY_STAGES[idx + 1];
  }
  return null;
}
