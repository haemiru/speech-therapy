import type { WordPrompt, SpeechLevel } from '@/types/speech';

const LEVEL_1_WORDS: WordPrompt[] = [
  { text: '가', emoji: '🎵', level: 1 },
  { text: '나', emoji: '🎵', level: 1 },
  { text: '다', emoji: '🎵', level: 1 },
  { text: '마', emoji: '🎵', level: 1 },
  { text: '바', emoji: '🎵', level: 1 },
  { text: '사', emoji: '🎵', level: 1 },
  { text: '아', emoji: '🎵', level: 1 },
  { text: '자', emoji: '🎵', level: 1 },
  { text: '하', emoji: '🎵', level: 1 },
  { text: '라', emoji: '🎵', level: 1 },
];

const LEVEL_2_WORDS: WordPrompt[] = [
  { text: '사과', emoji: '🍎', level: 2 },
  { text: '바나나', emoji: '🍌', level: 2 },
  { text: '고양이', emoji: '🐱', level: 2 },
  { text: '강아지', emoji: '🐶', level: 2 },
  { text: '토끼', emoji: '🐰', level: 2 },
  { text: '나비', emoji: '🦋', level: 2 },
  { text: '자동차', emoji: '🚗', level: 2 },
  { text: '비행기', emoji: '✈️', level: 2 },
  { text: '아이스크림', emoji: '🍦', level: 2 },
  { text: '물고기', emoji: '🐟', level: 2 },
];

const LEVEL_3_WORDS: WordPrompt[] = [
  { text: '안녕하세요', emoji: '👋', level: 3 },
  { text: '감사합니다', emoji: '🙏', level: 3 },
  { text: '사랑해요', emoji: '❤️', level: 3 },
  { text: '좋은 아침', emoji: '🌅', level: 3 },
  { text: '잘 자요', emoji: '🌙', level: 3 },
  { text: '맛있어요', emoji: '😋', level: 3 },
  { text: '재미있어', emoji: '😄', level: 3 },
  { text: '같이 놀자', emoji: '🤝', level: 3 },
];

const WORD_BANK: Record<SpeechLevel, WordPrompt[]> = {
  1: LEVEL_1_WORDS,
  2: LEVEL_2_WORDS,
  3: LEVEL_3_WORDS,
};

/**
 * 지정 레벨에서 랜덤 단어를 n개 선택 (중복 없이)
 */
export function getRandomWords(level: SpeechLevel, count: number): WordPrompt[] {
  const pool = [...WORD_BANK[level]];
  const result: WordPrompt[] = [];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }

  // 단어 수가 부족하면 풀에서 다시 뽑기
  while (result.length < count) {
    const pool2 = WORD_BANK[level];
    result.push(pool2[Math.floor(Math.random() * pool2.length)]);
  }

  return result;
}

export function getLevelLabel(level: SpeechLevel): string {
  switch (level) {
    case 1: return '음절';
    case 2: return '단어';
    case 3: return '문장';
  }
}
