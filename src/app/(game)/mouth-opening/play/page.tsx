'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCamera } from '@/hooks/useCamera';
import { useMouthMetrics } from '@/hooks/sensors/useMouthMetrics';
import { useGameTimer } from '@/hooks/game/useGameTimer';
import { useSuccessJudgment } from '@/hooks/game/useSuccessJudgment';
import { useProfileStore } from '@/stores/useProfileStore';
import { usePuppyStore } from '@/stores/usePuppyStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { useSound } from '@/hooks/useSound';
import { CameraView } from '@/components/game/CameraView';
import { GameHeader } from '@/components/game/GameHeader';
import { TargetDisplay } from '@/components/game/TargetDisplay';
import { GameProgress } from '@/components/game/GameProgress';
import { GaugeOverlay } from '@/components/ui/GaugeOverlay';
import { PauseOverlay } from '@/components/game/PauseOverlay';
import { CountdownOverlay } from '@/components/game/CountdownOverlay';
import { RoundFeedback } from '@/components/game/RoundFeedback';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import type { GamePhase, RoundResult, RoundType, GameResult } from '@/types/game';
import {
  ROUND_DURATION_SEC,
  STAR_THRESHOLDS,
  BONUS_PEAK_THRESHOLD,
  JAW_OPEN_MAX_FOR_PUCKER,
} from '@/constants/thresholds';

const OPEN_MESSAGES = [
  '입을 크~게 벌려봐!',
  '아~하고 크게 벌려봐!',
  '할 수 있어! 크게!',
];

const PUCKER_MESSAGES = [
  '입을 쪼~옥 오므려봐!',
  '뽀뽀 입 만들어봐! 💋',
  '물고기 입 해봐! 🐟',
];

/**
 * 5라운드 중 벌리기/오므리기를 랜덤 교대 배정 (최소 각 2회)
 */
function generateRoundTypes(totalRounds: number): RoundType[] {
  const types: RoundType[] = [];
  const minEach = Math.max(1, Math.floor(totalRounds * 0.4)); // 최소 40%

  // 각 유형 최소 보장
  for (let i = 0; i < minEach; i++) types.push('open');
  for (let i = 0; i < minEach; i++) types.push('pucker');

  // 나머지 랜덤
  while (types.length < totalRounds) {
    types.push(Math.random() < 0.5 ? 'open' : 'pucker');
  }

  // 셔플 (Fisher-Yates)
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }

  return types;
}

export default function MouthOpeningPlayPage() {
  const router = useRouter();
  const settings = useProfileStore((s) => s.settings);
  const addStars = usePuppyStore((s) => s.addStars);
  const addRecord = useHistoryStore((s) => s.addRecord);
  const { play, playFanfare } = useSound();

  const totalRounds = settings.totalRounds;

  // 라운드 유형 배정 (한 번만 생성)
  const roundTypes = useMemo(() => generateRoundTypes(totalRounds), [totalRounds]);

  // Game state
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [currentRound, setCurrentRound] = useState(1);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [countdownValue, setCountdownValue] = useState(3);
  const [currentValue, setCurrentValue] = useState(0);
  const peakValueRef = useRef(0);
  const startTimeRef = useRef<number>(0);

  // Current round type
  const currentRoundType = roundTypes[currentRound - 1] ?? 'open';
  const currentThreshold = currentRoundType === 'open'
    ? settings.mouthOpenThreshold
    : settings.lipPuckerThreshold;

  // Camera
  const camera = useCamera();

  // MediaPipe mouth metrics
  const mouthMetrics = useMouthMetrics();

  // Success judgment (threshold changes per round type)
  const judgment = useSuccessJudgment({
    threshold: currentThreshold,
    holdDurationMs: settings.holdDurationMs,
    onSuccess: () => handleRoundSuccess(),
  });

  // Round timer
  const timer = useGameTimer({
    durationSec: ROUND_DURATION_SEC,
    onTimeUp: () => handleRoundTimeUp(),
  });

  // ---- Initialization ----
  useEffect(() => {
    const setup = async () => {
      await camera.start();
      await mouthMetrics.init();
    };
    setup();

    return () => {
      camera.stop();
      mouthMetrics.stopDetection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start detection when camera and model are ready
  useEffect(() => {
    if (camera.isActive && mouthMetrics.isReady && camera.videoRef.current) {
      mouthMetrics.startDetection(camera.videoRef.current);
      startCountdown();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera.isActive, mouthMetrics.isReady]);

  // Track mouth metrics → update value + judgment (rAF polling to avoid state cascade)
  const judgmentRef = useRef(judgment);
  judgmentRef.current = judgment;
  const currentRoundTypeRef = useRef(currentRoundType);
  currentRoundTypeRef.current = currentRoundType;

  useEffect(() => {
    if (phase !== 'playing') return;

    let rafId: number;
    const tick = () => {
      const metrics = mouthMetrics.metricsRef.current;
      if (metrics) {
        let sensorValue: number;
        if (currentRoundTypeRef.current === 'open') {
          sensorValue = metrics.jawOpen;
        } else {
          sensorValue = metrics.jawOpen < JAW_OPEN_MAX_FOR_PUCKER
            ? metrics.mouthPucker
            : 0;
        }
        setCurrentValue(sensorValue);
        judgmentRef.current.update(sensorValue);
        if (sensorValue > peakValueRef.current) {
          peakValueRef.current = sensorValue;
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

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
      roundType: currentRoundType,
      success: true,
      peakValue: peakValueRef.current,
      holdDurationMs: settings.holdDurationMs,
      timestamp: Date.now(),
    };
    setRounds((prev) => [...prev, result]);

    setTimeout(() => proceedToNextRound(), 1500);
  }, [currentRound, currentRoundType, settings.holdDurationMs, timer, play]);

  const handleRoundTimeUp = useCallback(() => {
    play('fail');
    setPhase('round-fail');

    const result: RoundResult = {
      roundNumber: currentRound,
      roundType: currentRoundType,
      success: false,
      peakValue: peakValueRef.current,
      holdDurationMs: 0,
      timestamp: Date.now(),
    };
    setRounds((prev) => [...prev, result]);

    setTimeout(() => proceedToNextRound(), 1500);
  }, [currentRound, currentRoundType, play]);

  const proceedToNextRound = useCallback(() => {
    if (currentRound >= totalRounds) {
      finishGame();
    } else {
      setCurrentRound((r) => r + 1);
      peakValueRef.current = 0;
      judgment.reset();
      timer.reset();
      setPhase('playing');
      timer.start();
    }
  }, [currentRound, totalRounds, judgment, timer]);

  const finishGame = useCallback(() => {
    setPhase('finished');
    mouthMetrics.stopDetection();
    camera.stop();

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
      gameId: 'mouth-opening',
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
  }, [rounds, totalRounds, addStars, addRecord, playFanfare, router, mouthMetrics, camera]);

  const handlePause = useCallback(() => {
    setPhase('paused');
    timer.pause();
  }, [timer]);

  const handleResume = useCallback(() => {
    setPhase('playing');
    timer.resume();
  }, [timer]);

  const handleQuit = useCallback(() => {
    mouthMetrics.stopDetection();
    camera.stop();
    router.push('/home');
  }, [mouthMetrics, camera, router]);

  // ---- Encourage message ----
  const getEncourageMessage = () => {
    if (judgment.isAtTarget) return '잘했어! 유지해봐!';

    const messages = currentRoundType === 'open' ? OPEN_MESSAGES : PUCKER_MESSAGES;
    if (currentValue > currentThreshold * 0.5) return '조금만 더~!';
    return messages[currentRound % messages.length];
  };

  const isLoading = !camera.isActive || !mouthMetrics.isReady;
  const successCount = rounds.filter((r) => r.success).length;

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Header */}
      <GameHeader
        title="입 운동 게임"
        onBack={handleQuit}
        onPause={isLoading ? () => {} : handlePause}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col">
          <div className="h-14" /> {/* header space */}
          <LoadingScreen
            message={
              mouthMetrics.isLoading
                ? '얼굴 인식 모델 로딩 중...'
                : mouthMetrics.error
                  ? mouthMetrics.error
                  : '카메라 준비 중...'
            }
          />
        </div>
      )}

      {/* Target area */}
      {!isLoading && (
        <div className="px-4 mb-2">
          <TargetDisplay
            message={getEncourageMessage()}
            isAtTarget={judgment.isAtTarget}
            roundType={currentRoundType}
          />
        </div>
      )}

      {/* Camera (always rendered to keep video element persistent) */}
      <div className={`flex-1 px-4 relative min-h-0 ${isLoading ? 'invisible' : ''}`}>
        <CameraView
          videoRef={camera.videoRef}
          className="w-full h-full max-h-[300px]"
        />

        {/* Face not detected warning */}
        {!mouthMetrics.faceDetected && phase === 'playing' && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-warning/90 text-white px-4 py-1 rounded-full text-sm font-medium z-10">
            얼굴이 보이지 않아요!
          </div>
        )}

        {/* Pucker mode: jaw open warning */}
        {currentRoundType === 'pucker' && mouthMetrics.metricsRef.current && mouthMetrics.metricsRef.current.jawOpen >= JAW_OPEN_MAX_FOR_PUCKER && phase === 'playing' && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-pink-500/90 text-white px-4 py-1 rounded-full text-sm font-medium z-10">
            입을 다물고 오므려봐!
          </div>
        )}

        {/* Gauge overlay on camera */}
        <div className="absolute bottom-4 left-8 right-8 z-10">
          <GaugeOverlay
            value={currentValue}
            threshold={currentThreshold}
          />
        </div>
      </div>

      {/* Timer */}
      {phase === 'playing' && (
        <div className="px-4 py-2">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>남은 시간</span>
            <span className="font-bold">{timer.remainingSec}초</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-progress rounded-full transition-all duration-1000"
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

      <PauseOverlay
        open={phase === 'paused'}
        onResume={handleResume}
        onQuit={handleQuit}
      />
    </div>
  );
}
