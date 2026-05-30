'use client';

import { cn } from '@/utils/cn';

interface RoundFeedbackProps {
  success: boolean;
}

export function RoundFeedback({ success }: RoundFeedbackProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div className={cn(
        'animate-bounce-in text-center',
        success ? 'text-success' : 'text-gray-500'
      )}>
        <div className="text-7xl mb-2">
          {success ? '🎉' : '💪'}
        </div>
        <p className="text-2xl font-bold text-white drop-shadow-lg">
          {success ? '잘했어!' : '괜찮아! 다시 해보자!'}
        </p>
      </div>
    </div>
  );
}
