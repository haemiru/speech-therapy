/**
 * 한글 자모 분해 & Levenshtein 유사도 계산
 * - 목표 텍스트와 인식된 텍스트의 발음 유사도를 0~1로 산출
 */

// 초성 19자
const CHOSEONG = [
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ',
  'ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ',
];

// 중성 21자
const JUNGSEONG = [
  'ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ',
  'ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ',
];

// 종성 28자 (첫 번째는 종성 없음 = '')
const JONGSEONG = [
  '','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ',
  'ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ',
  'ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ',
];

const HANGUL_START = 0xAC00; // '가'
const HANGUL_END = 0xD7A3;   // '힣'

/**
 * 한글 한 글자를 초성/중성/종성 자모 배열로 분해
 * - 한글이 아닌 문자는 그대로 반환
 */
export function decomposeHangul(char: string): string[] {
  const code = char.charCodeAt(0);

  if (code < HANGUL_START || code > HANGUL_END) {
    return [char];
  }

  const offset = code - HANGUL_START;
  const cho = Math.floor(offset / (21 * 28));
  const jung = Math.floor((offset % (21 * 28)) / 28);
  const jong = offset % 28;

  const result = [CHOSEONG[cho], JUNGSEONG[jung]];
  if (jong !== 0) {
    result.push(JONGSEONG[jong]);
  }

  return result;
}

/**
 * 문자열 전체를 자모 배열로 변환
 * - 공백/특수문자는 제거하고 한글만 처리
 */
export function decomposeText(text: string): string[] {
  const cleaned = text.replace(/\s+/g, '').toLowerCase();
  const jamo: string[] = [];

  for (const char of cleaned) {
    jamo.push(...decomposeHangul(char));
  }

  return jamo;
}

/**
 * 표준 DP Levenshtein 편집 거리
 */
export function levenshteinDistance(a: string[], b: string[]): number {
  const m = a.length;
  const n = b.length;

  // prev/curr 1D DP (메모리 최적화)
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n];
}

/**
 * 자모 분해 기반 유사도 (0~1)
 * - 1 = 완전 일치, 0 = 완전 불일치
 */
export function jamoSimilarity(target: string, recognized: string): number {
  const targetJamo = decomposeText(target);
  const recognizedJamo = decomposeText(recognized);

  if (targetJamo.length === 0 && recognizedJamo.length === 0) return 1;
  if (targetJamo.length === 0 || recognizedJamo.length === 0) return 0;

  const distance = levenshteinDistance(targetJamo, recognizedJamo);
  const maxLen = Math.max(targetJamo.length, recognizedJamo.length);

  return 1 - distance / maxLen;
}
