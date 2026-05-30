'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/home');
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-dvh bg-gradient-to-b from-sky-100 to-sky-200">
      <div className="animate-float">
        <div className="text-8xl mb-6">🐶</div>
      </div>
      <h1 className="text-3xl font-bold text-gray-700 mb-2">소리야 놀자!</h1>
      <p className="text-gray-500 text-sm">로딩 중...</p>
      <div className="mt-8 w-48 h-1.5 bg-sky-200 rounded-full overflow-hidden">
        <div className="h-full bg-progress rounded-full animate-[gauge-fill_1.5s_ease-out_forwards]" style={{ '--gauge-target': '100%' } as React.CSSProperties} />
      </div>
    </div>
  );
}
