'use client';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = '준비 중...' }: LoadingScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <div className="animate-float text-6xl">🐶</div>
      <p className="text-gray-500 text-sm">{message}</p>
      <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full w-full bg-progress rounded-full animate-[gauge-fill_2s_ease-out_infinite]" style={{ '--gauge-target': '100%' } as React.CSSProperties} />
      </div>
    </div>
  );
}
