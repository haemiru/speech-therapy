'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSpeechRecognition } from '@/hooks/sensors/useSpeechRecognition';
import { useTTS } from '@/hooks/sensors/useTTS';
import { useSpeechJudgment } from '@/hooks/game/useSpeechJudgment';
import { useGameTimer } from '@/hooks/game/useGameTimer';
import { useProfileStore } from '@/stores/useProfileStore';
import { usePuppyStore } from '@/stores/usePuppyStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { useSound } from '@/hooks/useSound';
import { PromptCard } from '@/components/game/PromptCard';
import { SpeechFeedback } from '@/components/game/SpeechFeedback';
import { SimilarityMeter } from '@/components/game/SimilarityMeter';
import { GameHeader } from '@/components/game/GameHeader';
import { GameProgress } from '@/components/game/GameProgress';
import { CountdownOverlay } from '@/components/game/CountdownOverlay';
import { RoundFeedback } from '@/components/game/RoundFeedback';
import { PauseOverlay } from '@/components/game/PauseOverlay';
import { getRandomWords } from '@/constants/wordBank';
import type { GamePhase, RoundResult, GameResult } from '@/types/game';
import type { WordPrompt, SpeechRecognitionResult } from '@/types/speech';
import {
  SPEECH_ROUND_DURATION_SEC,
  STAR_THRESHOLDS,
  BONUS_PEAK_THRESHOLD,
  REST_BETWEEN_ROUNDS_SEC,
} from '@/constants/thresholds';

const REST_MESSAGES = [
  '잠깐 쉬자! 🌟',
  '잘하고 있어! 💪',
  '다음 단어 준비! 😊',
];

export default function FollowSpeechPlayPage() {
  const router = useRouter();
  const settings = useProfileStore((s) => s.settings);
  const addStars = usePuppyStore((s) => s.addStars);
  const addRecord = useHistoryStore((s) => s.addRecord);
  const { play, playFanfare } = useSound();

  const totalRounds = settings.followSpeechTotalRounds ?? 5;
  const threshold = settings.followSpeechThreshold ?? 0.6;
  const level = settings.followSpeechLevel ?? 1;

  // Game state
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [currentRound, setCurrentRound] = useState(1);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [countdownValue, setCountdownValue] = useState(3);
  const [restCountdown, setRestCountdown] = useState(0);
  const [currentSimilarity, setCurrentSimilarity] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [prompts, setPrompts] = useState<WordPrompt[]>([]);
  const [unsupported, setUnsupported] = useState(false);

  const peakValueRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const phaseRef = useRef<GamePhase>('ready');
  phaseRef.current = phase;

  // Sensors & judgment
  const speechRecognition = useSpeechRecognition();
  const tts = useTTS();

  const handleRoundSuccessRef = useRef<(result: SpeechRecognitionResult) => void>(() => {});

  const judgment = useSpeechJudgment({
    threshold,
    onSuccess: (result) => handleRoundSuccessRef.current(result),
  });

  const timer = useGameTimer({
    durationSec: SPEECH_ROUND_DURATION_SEC,
    onTimeUp: () => handleRoundTimeUp(),
  });

  const currentPrompt = prompts[currentRound - 1];

  // ---- Initialize ----
  useEffect(() => {
    if (!speechRecognition.isSupported) {
      setUnsupported(true);
      return;
    }

    speechRecognition.init();
    const words = getRandomWords(level, totalRounds);
    setPrompts(words);

    // Auto-start countdown after brief delay
    const t = setTimeout(() => startCountdown(), 500);
    return () => {
      clearTimeout(t);
      speechRecognition.stopListening();
      tts.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Recognition result handler ----
  const handleRecognitionResult = useCallback((result: SpeechRecognitionResult) => {
    setCurrentTranscript(result.transcript);
    setCurrentSimilarity(result.similarity);

    if (result.similarity > peakValueRef.current) {
      peakValueRef.current = result.similarity;
    }

    judgment.judge(result);
  }, [judgment]);

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
        startRound();
      }
    }, 1000);
  }, [play]);

  const startRound = useCallback(async () => {
    peakValueRef.current = 0;
    setCurrentSimilarity(0);
    setCurrentTranscript('');
    judgment.reset();
    timer.reset();

    const prompt = prompts[currentRound - 1];
    if (!prompt) return;

    // TTS 재생 → 완료 후 인식 시작
    try {
      await tts.speak(prompt.text);
    } catch {
      // TTS 실패해도 계속 진행
    }

    // TTS 후 인식 시작
    if (phaseRef.current === 'playing') {
      speechRecognition.startListening(prompt.text, handleRecognitionResult);
      timer.start();
    }
  }, [prompts, currentRound, tts, speechRecognition, judgment, timer, handleRecognitionResult]);

  // Wire up the success ref
  const handleRoundSuccess = useCallback((result: SpeechRecognitionResult) => {
    speechRecognition.stopListening();
    timer.pause();
    play('success');
    setPhase('round-success');

    const roundResult: RoundResult = {
      roundNumber: currentRound,
      roundType: 'follow-speech',
      success: true,
      peakValue: result.similarity,
      holdDurationMs: 0,
      timestamp: Date.now(),
    };
    setRounds((prev) => [...prev, roundResult]);

    setTimeout(() => proceedToNextRound(), 1500);
  }, [currentRound, speechRecognition, timer, play]);

  // Keep ref in sync
  handleRoundSuccessRef.current = handleRoundSuccess;

  const handleRoundTimeUp = useCallback(() => {
    speechRecognition.stopListening();
    play('fail');
    setPhase('round-fail');

    const roundResult: RoundResult = {
      roundNumber: currentRound,
      roundType: 'follow-speech',
      success: false,
      peakValue: peakValueRef.current,
      holdDurationMs: 0,
      timestamp: Date.now(),
    };
    setRounds((prev) => [...prev, roundResult]);

    setTimeout(() => proceedToNextRound(), 1500);
  }, [currentRound, speechRecognition, play]);

  const proceedToNextRound = useCallback(() => {
    if (currentRound >= totalRounds) {
      finishGame();
    } else {
      setPhase('resting');
      let restTime = REST_BETWEEN_ROUNDS_SEC;
      setRestCountdown(restTime);

      const restInterval = setInterval(() => {
        restTime--;
        setRestCountdown(restTime);
        if (restTime <= 0) {
          clearInterval(restInterval);
          setCurrentRound((r) => r + 1);
          setPhase('playing');
          // startRound will be triggered by currentRound change
        }
      }, 1000);
    }
  }, [currentRound, totalRounds]);

  // Start round when currentRound changes during playing phase
  const prevRoundRef = useRef(currentRound);
  useEffect(() => {
    if (currentRound !== prevRoundRef.current && phase === 'playing') {
      prevRoundRef.current = currentRound;
      startRound();
    }
  }, [currentRound, phase, startRound]);

  const finishGame = useCallback(() => {
    setPhase('finished');
    speechRecognition.stopListening();
    tts.cancel();

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
      gameId: 'follow-speech',
      totalRounds,
      successCount,
      starsEarned,
      rounds: allRounds,
      totalDurationMs: Date.now() - startTimeRef.current,
      peakValue,
      completedAt: Date.now(),
    };

    if (starsEarned > 0) addStars(starsEarned);
    addRecord(gameResult);
    playFanfare();

    setTimeout(() => {
      sessionStorage.setItem('lastGameResult', JSON.stringify(gameResult));
      router.push('/result');
    }, 1000);
  }, [rounds, totalRounds, addStars, addRecord, playFanfare, router, speechRecognition, tts]);

  const handlePlayTTS = useCallback(() => {
    if (currentPrompt) {
      tts.speak(currentPrompt.text);
    }
  }, [currentPrompt, tts]);

  const handlePause = useCallback(() => {
    setPhase('paused');
    timer.pause();
    speechRecognition.stopListening();
  }, [timer, speechRecognition]);

  const handleResume = useCallback(() => {
    setPhase('playing');
    timer.resume();
    if (currentPrompt) {
      speechRecognition.startListening(currentPrompt.text, handleRecognitionResult);
    }
  }, [timer, speechRecognition, currentPrompt, handleRecognitionResult]);

  const handleQuit = useCallback(() => {
    speechRecognition.stopListening();
    tts.cancel();
    router.push('/home');
  }, [speechRecognition, tts, router]);

  // ---- Unsupported browser ----
  if (unsupported) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">
          음성 인식을 사용할 수 없어요
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          이 게임은 Chrome 브라우저에서만 작동합니다.
          <br />
          Chrome으로 다시 접속해주세요.
        </p>
        <button
          onClick={() => router.push('/home')}
          className="px-6 py-3 bg-sky-500 text-white font-bold rounded-xl active:scale-95 transition-transform"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const successCount = rounds.filter((r) => r.success).length;

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Header */}
      <GameHeader
        title="따라 말하기"
        onBack={handleQuit}
        onPause={handlePause}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col px-4 min-h-0">
        {/* Prompt Card */}
        {currentPrompt && phase === 'playing' && (
          <>
            <PromptCard
              prompt={currentPrompt}
              isListening={speechRecognition.isListening}
              onPlayTTS={handlePlayTTS}
              className="mb-3"
            />

            {/* Speech Feedback */}
            <SpeechFeedback
              recognizedText={currentTranscript}
              similarity={currentSimilarity}
              threshold={threshold}
              isListening={speechRecognition.isListening}
              className="mb-2"
            />

            {/* Similarity Meter */}
            <SimilarityMeter
              value={currentSimilarity}
              threshold={threshold}
              className="mb-3"
            />
          </>
        )}

        {/* Error display */}
        {speechRecognition.error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-3 mb-3 text-sm text-center">
            {speechRecognition.error}
          </div>
        )}
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
              className="h-full bg-sky-400 rounded-full transition-all duration-1000"
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

      {/* Rest between rounds */}
      {phase === 'resting' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl p-8 mx-8 text-center shadow-xl">
            <div className="text-5xl mb-4">😌</div>
            <p className="text-xl font-bold text-sky-500 mb-2">
              {REST_MESSAGES[currentRound % REST_MESSAGES.length]}
            </p>
            <p className="text-gray-500 mb-4">다음 단어까지</p>
            <div className="text-4xl font-bold text-sky-400">
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
