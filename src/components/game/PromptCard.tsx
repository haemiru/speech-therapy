'use client';

import { cn } from '@/utils/cn';
import type { WordPrompt } from '@/types/speech';

interface PromptCardProps {
  prompt: WordPrompt;
  isListening: boolean;
  onPlayTTS: () => void;
  className?: string;
}

export function PromptCard({ prompt, isListening, onPlayTTS, className }: PromptCardProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-6 px-4 rounded-3xl transition-all duration-300',
      isListening ? 'bg-green-50 shadow-lg shadow-green-100' : 'bg-white/80',
      className,
    )}>
      {/* 큰 이모지 */}
      <div className={cn(
        'text-7xl mb-3 transition-transform duration-500',
        isListening && 'animate-bounce-slow',
      )}>
        {prompt.emoji}
      </div>

      {/* 목표 텍스트 */}
      <div className={cn(
        'font-black mb-4 transition-all duration-300',
        prompt.level === 1 ? 'text-5xl' : prompt.level === 2 ? 'text-4xl' : 'text-3xl',
        isListening ? 'text-green-600' : 'text-gray-800',
      )}>
        {prompt.text}
      </div>

      {/* 다시 듣기 버튼 */}
      <button
        type="button"
        onClick={onPlayTTS}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-100 text-sky-600 font-bold text-sm active:scale-95 transition-transform"
      >
        <span className="text-lg">🔊</span>
        다시 듣기
      </button>
    </div>
  );
}
