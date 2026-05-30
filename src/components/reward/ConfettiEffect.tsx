'use client';

import { useEffect, useState } from 'react';

const CONFETTI_ITEMS = ['🌟', '✨', '🎉', '💛', '⭐', '🎊', '💫'];

interface Particle {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
}

export function ConfettiEffect() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const items: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: CONFETTI_ITEMS[i % CONFETTI_ITEMS.length],
      left: Math.random() * 100,
      delay: Math.random() * 1,
      duration: 1.5 + Math.random() * 1.5,
    }));
    setParticles(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-2xl animate-confetti"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
