'use client';

import { useRef, useCallback } from 'react';
import { useProfileStore } from '@/stores/useProfileStore';

type SoundType = 'success' | 'fail' | 'star' | 'fanfare' | 'click' | 'countdown';

// Simple beep sounds using Web Audio API (no audio files needed for MVP)
const SOUND_FREQUENCIES: Record<SoundType, { freq: number; duration: number; type: OscillatorType }> = {
  success: { freq: 880, duration: 0.2, type: 'sine' },
  fail: { freq: 330, duration: 0.3, type: 'triangle' },
  star: { freq: 1200, duration: 0.15, type: 'sine' },
  fanfare: { freq: 660, duration: 0.5, type: 'square' },
  click: { freq: 600, duration: 0.05, type: 'sine' },
  countdown: { freq: 440, duration: 0.1, type: 'sine' },
};

export function useSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundEnabled = useProfileStore((s) => s.settings.soundEnabled);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const play = useCallback(
    (type: SoundType) => {
      if (!soundEnabled) return;

      try {
        const ctx = getAudioContext();
        const { freq, duration, type: waveType } = SOUND_FREQUENCIES[type];

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = waveType;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        // Ignore audio errors
      }
    },
    [soundEnabled, getAudioContext]
  );

  const playFanfare = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.3);
      });
    } catch {
      // Ignore
    }
  }, [soundEnabled, getAudioContext]);

  return { play, playFanfare };
}
