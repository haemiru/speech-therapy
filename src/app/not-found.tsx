'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-dvh bg-gradient-to-b from-sky-100 to-sky-200 p-6 text-center">
      <div className="text-8xl mb-4 animate-float">🐶</div>
      <h1 className="text-2xl font-bold text-gray-700 mb-2">
        앗, 여기는 없는 페이지야!
      </h1>
      <p className="text-gray-500 mb-6">
        홈으로 돌아가서 놀자!
      </p>
      <Button size="lg" onClick={() => router.push('/home')}>
        🏠 홈으로 가기
      </Button>
    </div>
  );
}
