'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';

interface BackButtonProps {
  href?: string;
  className?: string;
}

export function BackButton({ href, className }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-12 h-12 rounded-full bg-white/80 shadow-md flex items-center justify-center',
        'active:scale-90 transition-transform touch-target',
        className
      )}
      aria-label="뒤로가기"
    >
      <span className="text-xl">←</span>
    </button>
  );
}
