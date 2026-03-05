'use client';

import { cn } from '@/utils/cn';

interface SpeechFeedbackProps {
  recognizedText: string;
  similarity: number;
  threshold: number;
  isListening: boolean;
  className?: string;
}

function getEncourageMessage(similarity: number, threshold: number, hasText: boolean): string {
  if (!hasText) return '말해봐! 🎤';
  if (similarity >= threshold) return '잘했어! 🎉';
  if (similarity >= 0.7) return '거의 맞았어! 한 번 더! 💪';
  if (similarity >= 0.4) return '좋아! 조금만 더! 😊';
  return '다시 해볼까? 🌟';
}

export function SpeechFeedback({
  recognizedText,
  similarity,
  threshold,
  isListening,
  className,
}: SpeechFeedbackProps) {
  const hasText = recognizedText.length > 0;
  const message = getEncourageMessage(similarity, threshold, hasText);

  return (
    <div className={cn('text-center py-3', className)}>
      {/* 마이크 상태 + 인식 텍스트 */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {isListening && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="w-1.5 h-4 bg-green-500 rounded-full animate-pulse [animation-delay:0.15s]" />
            <span className="w-1.5 h-3 bg-green-400 rounded-full animate-pulse [animation-delay:0.3s]" />
          </div>
        )}
        <span className="text-xs text-gray-400">
          {isListening ? '듣고 있어요...' : '준비 중...'}
        </span>
      </div>

      {/* 인식된 텍스트 말풍선 */}
      {hasText && (
        <div className="inline-block bg-gray-100 rounded-2xl px-5 py-2 mb-2">
          <span className="text-xl font-bold text-gray-700">
            &ldquo;{recognizedText}&rdquo;
          </span>
        </div>
      )}

      {/* 격려 메시지 */}
      <p className={cn(
        'text-lg font-bold transition-colors',
        similarity >= threshold ? 'text-green-500' : 'text-gray-600',
      )}>
        {message}
      </p>
    </div>
  );
}
