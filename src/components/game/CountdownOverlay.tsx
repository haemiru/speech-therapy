'use client';

interface CountdownOverlayProps {
  value: number;
}

export function CountdownOverlay({ value }: CountdownOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 backdrop-blur-sm">
      <div className="animate-bounce-in">
        <span className="text-8xl font-bold text-white drop-shadow-lg">
          {value}
        </span>
      </div>
    </div>
  );
}
