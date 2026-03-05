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
        // 카운트다운 후 탭 대기 화면으로 전환
        setPhase('waiting');
      }
    }, 1000);
  }, [play]);

  // 사용자가 탭하면 TTS 재생 + 인식 시작 (사용자 제스처 컨텍스트 필요)
  const handleTapToStart = useCallback(() => {
    const prompt = prompts[currentRound - 1];
    if (!prompt) return;

    peakValueRef.current = 0;
    setCurrentSimilarity(0);
    setCurrentTranscript('');
    judgment.reset();
    timer.reset();

    setPhase('playing');

    // 동기적으로 TTS + 인식 + 타이머 모두 시작 (사용자 제스처 컨텍스트 유지)
    tts.speak(prompt.text).catch(() => {});
    speechRecognition.startListening(prompt.text, handleRecognitionResult);
    timer.start();
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
          // 다음 라운드도 탭 대기 화면으로
          setPhase('waiting');
        }
      }, 1000);
    }
  }, [currentRound, totalRounds]);

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
              ttsAvailable={tts.isSupported}
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

            {/* 인식 끊김 → 다시 말하기 버튼 */}
            {speechRecognition.needsRetry && (
              <button
                type="button"
                onClick={speechRecognition.retry}
                className="mx-auto flex items-center gap-2 px-6 py-3 rounded-full bg-green-500 text-white font-bold text-base active:scale-95 transition-transform animate-pulse"
              >
                <span className="text-xl">🎤</span>
                다시 말하기
              </button>
            )}
          </>
        )}

        {/* Error display - 음성 인식 오류 시 전체 화면 안내 */}
        {speechRecognition.error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
            <div className="text-6xl">😢</div>
            <p className="text-lg font-bold text-gray-700">{speechRecognition.error}</p>
            <button
              onClick={() => router.push('/home')}
              className="mt-2 px-6 py-3 bg-sky-500 text-white font-bold rounded-xl active:scale-95 transition-transform"
            >
              홈으로 돌아가기
            </button>
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

      {/* Waiting overlay — 사용자 탭으로 TTS + 인식 시작 */}
      {phase === 'waiting' && currentPrompt && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
          <button
            type="button"
            onClick={handleTapToStart}
            className="bg-white rounded-3xl p-8 mx-8 text-center shadow-xl active:scale-95 transition-transform"
          >
            <div className="text-7xl mb-3">{currentPrompt.emoji}</div>
            <div className="text-4xl font-black text-gray-800 mb-4">{currentPrompt.text}</div>
            <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-green-500 text-white font-bold text-lg">
              <span className="text-2xl">🔊</span>
              탭하여 듣기
            </div>
            <p className="text-sm text-gray-400 mt-3">듣고 따라 말해봐!</p>
          </button>
        </div>
      )}

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
