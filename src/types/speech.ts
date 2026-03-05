export type SpeechLevel = 1 | 2 | 3;

export interface WordPrompt {
  text: string;
  emoji: string;
  level: SpeechLevel;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  similarity: number;
  isFinal: boolean;
}
