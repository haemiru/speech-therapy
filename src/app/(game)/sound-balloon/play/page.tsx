'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMicrophoneVolume } from '@/hooks/sensors/useMicrophoneVolume';
import { useGameTimer } from '@/hooks/game/useGameTimer';
import { useSuccessJudgment } from '@/hooks/game/useSuccessJudgment';
import { useProfileStore } from '@/stores/useProfileStore';
import { usePuppyStore } from '@/stores/usePuppyStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { useSound } from '@/hooks/useSound';
import { BalloonScene } from '@/components/game/BalloonScene';
import { VolumeMeter } from '@/components/game/VolumeMeter';
import { GameHeader } from '@/components/game/GameHeader';
import { GameProgress } from '@/components/game/GameProgress';
import { CountdownOverlay } from '@/components/game/CountdownOverlay';
import { RoundFeedback } from '@/components/game/RoundFeedback';
import { PauseOverlay } from '@/components/game/PauseOverlay';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import type { GamePhase, RoundResult, GameResult } from '@/types/game';
import {
  ROUND_DURATION_SEC,
  STAR_THRESHOLDS,
  BONUS_PEAK_THRESHOLD,
  SOUND_BALLOON_DESCENT_RATE,
  REST_BETWEEN_ROUNDS_SEC,
} from '@/constants/thresholds';

const ENCOURAGE_MESSAGES = [
  '아~ 하고 소리 내봐! 🎤',
  '크~게 소리 내봐!',
  '할 수 있어! 소리를 내자!',
];

const REST_MESSAGES = [
  '잠깐 쉬자! 🌟',
  '목이 아프면 쉬어도 괜찮아~',
  '잘하고 있어! 조금만 쉬자 💪',
];

export default function SoundBalloonPlayPage() {
  const router = useRouter();
  const settings = useProfileStore((s) => s.settings);
  const addStars = usePuppyStore((s) => s.addStars);
  const addRecord = useHistoryStore((s) => s.addRecord);
  const { play, playFanfare } = useSound();

  const totalRounds = settings.soundBalloonTotalRounds ?? 5;
  const threshold = settings.soundBalloonThreshold ?? 0.3;
  const holdDurationMs = settings.soundBalloonHoldMs ?? 1000;

  // Game state
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [currentRound, setCurrentRound] = useState(1);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [countdownValue, setCountdownValue] = useState(3);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [balloonHeight, setBalloonHeight] = useState(0);
  const [restCountdown, setRestCountdown] = useState(0);
  const peakValueRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const balloonHeightRef = useRef(0);

  // Microphone
  const mic = useMicrophoneVolume();

  // Success judgment
  const judgment = useSuccessJudgment({
    threshold,
    holdDurationMs,
    onSuccess: () => handleRoundSuccess(),
  });

  // Round timer
  const timer = useGameTimer({
    durationSec: ROUND_DURATION_SEC,
    onTimeUp: () => handleRoundTimeUp(),
  });

  // ---- Initialization ----
  useEffect(() => {
    mic.init();

    return () => {
      mic.stopDetection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start detection when mic is ready
  useEffect(() => {
    if (mic.isReady) {
      mic.startDetection();
      startCountdown();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mic.isReady]);

  // Track volume → update balloon height + judgment (rAF polling)
  const judgmentRef = useRef(judgment);
  judgmentRef.current = judgment;

  useEffect(() => {
    if (phase !== 'playing') return;

    let rafId: number;
    const tick = () => {
      const volume = mic.volumeRef.current;
      setCurrentVolume(volume);

      // Balloon physics: rise when vocalizing, descend when silent
      const isVocalizing = volume >= threshold;
      let newHeight = balloonHeightRef.current;

      if (isVocalizing) {
        // Rise proportional to volume above threshold
        const riseRate = 0.02 + (volume - threshold) * 0.05;
        newHeight = Math.min(1, newHeight + riseRate);
      } else {
        // Descend slowly
        newHeight = Math.max(0, newHeight - SOUND_BALLOON_DESCENT_RATE);
      }

      balloonHeightRef.current = newHeight;
      setBalloonHeight(newHeight);

      // Feed judgment with volume
      judgmentRef.current.update(volume);

      if (volume > peakValueRef.current) {
        peakValueRef.current = volume;
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, threshold]);

  // ---- Game Flow ----
  const startCountdown = useCallback(() => {
    setPhase('countdown');
    startTimeRef.current = Date.now();
    let count = 3;
    setCountdownValue(3);
    play('countdown');

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownValue(count);
        play('countdown');
      } else {
        clearInterval(interval);
        setPhase('playing');
        peakValueRef.current = 0;
        balloonHeightRef.current = 0;
        setBalloonHeight(0);
        judgment.reset();
        timer.start();
      }
    }, 1000);
  }, [play, judgment, timer]);

  const handleRoundSuccess = useCallback(() => {
    timer.pause();
    play('success');
    setPhase('round-success');

    const result: RoundResult = {
      roundNumber: currentRound,
      roundType: 'sustain',
      success: true,
      peakValue: peakValueRef.current,
      holdDurationMs,
      timestamp: Date.now(),
    };
    setRounds((prev) => [...prev, result]);

    setTimeout(() => proceedToNextRound(), 1500);
  }, [currentRound, holdDurationMs, timer, play]);

  const handleRoundTimeUp = useCallback(() => {
    play('fail');
    setPhase('round-fail');

    const result: RoundResult = {
      roundNumber: currentRound,
      roundType: 'sustain',
      success: false,
      peakValue: peakValueRef.current,
      holdDurationMs: 0,
      timestamp: Date.now(),
    };
    setRounds((prev) => [...prev, result]);

    setTimeout(() => proceedToNextRound(), 1500);
  }, [currentRound, play]);

  const proceedToNextRound = useCallback(() => {
    if (currentRound >= totalRounds) {
      finishGame();
    } else {
      // Rest between rounds
      setPhase('resting');
      let restTime = REST_BETWEEN_ROUNDS_SEC;
      setRestCountdown(restTime);

      const restInterval = setInterval(() => {
        restTime--;
        setRestCountdown(restTime);
        if (restTime <= 0) {
          clearInterval(restInterval);
          setCurrentRound((r) => r + 1);
          peakValueRef.current = 0;
          balloonHeightRef.current = 0;
          setBalloonHeight(0);
          judgment.reset();
          timer.reset();
          setPhase('playing');
          timer.start();
        }
      }, 1000);
    }
  }, [currentRound, totalRounds, judgment, timer]);

  const finishGame = useCallback(() => {
    setPhase('finished');
    mic.stopDetection();

    // Calculate result
    const allRounds = [...rounds];
    const successCount = allRounds.filter((r) => r.success).length;
    const peakValue = Math.max(0, ...allRounds.map((r) => r.peakValue));

    let starsEarned = 0;
    const rate = successCount / totalRounds;
    if (rate >= STAR_THRESHOLDS.three) starsEarned = 3;
    else if (rate >= STAR_THRESHOLDS.two) starsEarned = 2;
    else if (successCount > 0) starsEarned = 1;
    if (peakValue >= BONUS_PEAK_THRESHOLD) starsEarned += 1;

    const gameResult: GameResult = {
      gameId: 'sound-balloon',
      totalRounds,
      successCount,
      starsEarned,
      rounds: allRounds,
      totalDurationMs: Date.now() - startTimeRef.current,
      peakValue,
      completedAt: Date.now(),
    };

    // Apply rewards
    if (starsEarned > 0) addStars(starsEarned);
    addRecord(gameResult);
    playFanfare();

    // Navigate to result after short delay
    setTimeout(() => {
      sessionStorage.setItem('lastGameResult', JSON.stringify(gameResult));
      router.push('/result');
    }, 1000);
  }, [rounds, totalRounds, addStars, addRecord, playFanfare, router, mic]);

  const handlePause = useCallback(() => {
    setPhase('paused');
    timer.pause();
  }, [timer]);

  const handleResume = useCallback(() => {
    setPhase('playing');
    timer.resume();
  }, [timer]);

  const handleQuit = useCallback(() => {
    mic.stopDetection();
    router.push('/home');
  }, [mic, router]);

  // ---- Encourage message ----
  const getEncourageMessage = () => {
    if (judgment.isAtTarget) return '잘하고 있어! 계속! 🎶';
    if (currentVolume > threshold * 0.5) return '조금만 더 크게!';
    return ENCOURAGE_MESSAGES[currentRound % ENCOURAGE_MESSAGES.length];
  };

  const isLoading = !mic.isReady;
  const successCount = rounds.filter((r) => r.success).length;
  const isVocalizing = currentVolume >= threshold;

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Header */}
      <GameHeader
        title="소리 열기구"
        onBack={handleQuit}
        onPause={isLoading ? () => {} : handlePause}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col">
          <div className="h-14" />
          <LoadingScreen
            message={
              mic.error
                ? mic.error
                : '마이크 준비 중...'
            }
          />
        </div>
      )}

      {/* Encourage message */}
      {!isLoading && phase !== 'resting' && (
        <div className="px-4 mb-2 text-center">
          <p className={`text-lg font-bold transition-colors ${
            judgment.isAtTarget ? 'text-orange-500' : 'text-gray-700'
          }`}>
            {getEncourageMessage()}
          </p>
        </div>
      )}

      {/* Balloon scene */}
      <div className={`flex-1 px-4 relative min-h-0 ${isLoading ? 'invisible' : ''}`}>
        <BalloonScene
          height={balloonHeight}
          isVocalizing={isVocalizing}
          className="w-full h-full max-h-[350px]"
        />
      </div>

      {/* Volume meter */}
      {!isLoading && phase === 'playing' && (
        <div className="px-4 py-2">
          <VolumeMeter
            value={currentVolume}
            threshold={threshold}
          />
        </div>
      )}

      {/* Timer */}
      {phase === 'playing' && (
        <div className="px-4 py-2">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>남은 시간</span>
            <span className="font-bold">{timer.remainingSec}초</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-1000"
              style={{ width: `${(1 - timer.progress) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="px-4 pb-4">
        <GameProgress
          currentRound={currentRound}
          totalRounds={totalRounds}
          successCount={successCount}
        />
      </div>

      {/* Overlays */}
      {phase === 'countdown' && (
        <CountdownOverlay value={countdownValue} />
      )}

      {(phase === 'round-success' || phase === 'round-fail') && (
        <RoundFeedback success={phase === 'round-success'} />
      )}

      {/* Rest between rounds overlay */}
      {phase === 'resting' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl p-8 mx-8 text-center shadow-xl">
            <div className="text-5xl mb-4">😌</div>
            <p className="text-xl font-bold text-orange-500 mb-2">
              {REST_MESSAGES[currentRound % REST_MESSAGES.length]}
            </p>
            <p className="text-gray-500 mb-4">다음 라운드까지</p>
            <div className="text-4xl font-bold text-orange-400">
              {restCountdown}
            </div>
          </div>
        </div>
      )}

      <PauseOverlay
        open={phase === 'paused'}
        onResume={handleResume}
        onQuit={handleQuit}
      />
    </div>
  );
}
