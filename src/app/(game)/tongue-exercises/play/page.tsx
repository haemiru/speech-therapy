'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
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
  TONGUE_HOLD_DURATION_MS,
  TONGUE_REST_BETWEEN_ROUNDS_SEC,
} from '@/constants/thresholds';

const TONGUE_MESSAGES = [
  '혀를 내밀어봐! 😛',
  '길~게 내밀어봐!',
  '할 수 있어! 혀를 쭉!',
];

const REST_MESSAGES = [
  '잠깐 쉬자! 🌟',
  '혀가 힘들면 쉬어도 괜찮아~',
  '잘하고 있어! 조금만 쉬자 💪',
];

export default function TongueExercisesPlayPage() {
  const router = useRouter();
  const settings = useProfileStore((s) => s.settings);
  const addStars = usePuppyStore((s) => s.addStars);
  const addRecord = useHistoryStore((s) => s.addRecord);
  const { play, playFanfare } = useSound();

  // MediaPipe Face Landmarker는 tongueOut 블렌드셰이프를 지원하지 않음
  // 임상적으로 혀 내밀기 시 반드시 입을 벌리므로, jawOpen을 프록시로 사용
  const totalRounds = settings.tongueTotalRounds ?? settings.totalRounds;
  const threshold = settings.tongueThreshold ?? 0.3;
  const holdDurationMs = settings.tongueHoldDurationMs ?? TONGUE_HOLD_DURATION_MS;

  // Level 1: tongue-out only for all rounds
  const roundTypes: RoundType[] = Array(totalRounds).fill('tongue-out');

  // Game state
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [currentRound, setCurrentRound] = useState(1);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [countdownValue, setCountdownValue] = useState(3);
  const [currentValue, setCurrentValue] = useState(0);
  const [restCountdown, setRestCountdown] = useState(0);
  const peakValueRef = useRef(0);
  const startTimeRef = useRef<number>(0);

  // Current round type
  const currentRoundType = roundTypes[currentRound - 1] ?? 'tongue-out';

  // Camera
  const camera = useCamera();

  // MediaPipe mouth metrics (includes tongue)
  const mouthMetrics = useMouthMetrics();

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

  // Track tongue metrics → update value + judgment (rAF polling)
  const judgmentRef = useRef(judgment);
  judgmentRef.current = judgment;

  useEffect(() => {
    if (phase !== 'playing') return;

    let rafId: number;
    const tick = () => {
      const metrics = mouthMetrics.metricsRef.current;
      if (metrics) {
        // jawOpen을 프록시로 사용 (tongueOut 미지원)
        const sensorValue = metrics.jawOpen;
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
      holdDurationMs,
      timestamp: Date.now(),
    };
    setRounds((prev) => [...prev, result]);

    setTimeout(() => proceedToNextRound(), 1500);
  }, [currentRound, currentRoundType, holdDurationMs, timer, play]);

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
      // Rest between rounds (tongue muscle fatigue)
      setPhase('resting');
      let restTime = TONGUE_REST_BETWEEN_ROUNDS_SEC;
      setRestCountdown(restTime);

      const restInterval = setInterval(() => {
        restTime--;
        setRestCountdown(restTime);
        if (restTime <= 0) {
          clearInterval(restInterval);
          setCurrentRound((r) => r + 1);
          peakValueRef.current = 0;
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
      gameId: 'tongue-exercises',
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
    if (currentValue > threshold * 0.5) return '조금만 더~!';
    return TONGUE_MESSAGES[currentRound % TONGUE_MESSAGES.length];
  };

  const isLoading = !camera.isActive || !mouthMetrics.isReady;
  const successCount = rounds.filter((r) => r.success).length;

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Header */}
      <GameHeader
        title="혀 운동 게임"
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
      {!isLoading && phase !== 'resting' && (
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


        {/* Gauge overlay on camera */}
        <div className="absolute bottom-4 left-8 right-8 z-10">
          <GaugeOverlay
            value={currentValue}
            threshold={threshold}
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

      {/* Rest between rounds overlay */}
      {phase === 'resting' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl p-8 mx-8 text-center shadow-xl">
            <div className="text-5xl mb-4">😌</div>
            <p className="text-xl font-bold text-purple-600 mb-2">
              {REST_MESSAGES[currentRound % REST_MESSAGES.length]}
            </p>
            <p className="text-gray-500 mb-4">다음 라운드까지</p>
            <div className="text-4xl font-bold text-purple-500">
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
