export type PuppyStage = 1 | 2 | 3 | 4 | 5;

export interface PuppyStageDef {
  stage: PuppyStage;
  name: string;
  emoji: string;
  requiredStars: number;
  description: string;
}

export interface PuppyState {
  totalStars: number;
  currentStage: PuppyStage;
  name: string;
  createdAt: number;
  lastInteraction: number;
}
