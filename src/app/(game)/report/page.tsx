'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BackButton } from '@/components/ui/BackButton';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { GAMES } from '@/constants/games';
import type { ReportData, ReportResponse } from '@/types/report';

type PageState = 'idle' | 'loading' | 'done' | 'error';

const LOADING_MESSAGES = [
  '기록을 읽고 있어요...',
  '패턴을 분석하고 있어요...',
  '보고서를 작성하고 있어요...',
];

function getGameIcon(gameId: string): string {
  return GAMES.find((g) => g.id === gameId)?.icon ?? '🎮';
}

export default function ReportPage() {
  const { records } = useHistoryStore();
  const { child, settings } = useProfileStore();

  const [state, setState] = useState<PageState>('idle');
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // Rotate loading messages
  useEffect(() => {
    if (state !== 'loading') return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [state]);

  const gameRecords = useMemo(
    () => records.filter((r) => r.gameId !== 'my-records' && r.gameId !== 'report'),
    [records]
  );

  const generate = useCallback(async () => {
    setState('loading');
    setLoadingMsgIdx(0);
    setError('');

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: gameRecords, child, settings }),
      });

      const data: ReportResponse = await res.json();

      if (data.success && data.report) {
        setReport(data.report);
        setState('done');
      } else {
        setError(data.error ?? '보고서 생성에 실패했습니다.');
        setState('error');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setState('error');
    }
  }, [gameRecords, child, settings]);

  // Idle state
  if (state === 'idle') {
    return (
      <div className="flex-1 flex flex-col p-4 safe-bottom">
        <div className="flex items-center gap-3 py-4">
          <BackButton href="/home" />
          <h1 className="text-2xl font-bold text-gray-700">AI 보고서</h1>
        </div>

        {gameRecords.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <span className="text-6xl">📝</span>
            <p className="text-lg font-bold text-gray-600">게임을 먼저 해봐요!</p>
            <p className="text-sm text-gray-400">
              게임 기록이 있어야 보고서를 만들 수 있어요
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4">
            {/* Summary card */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h2 className="text-sm font-bold text-gray-500 mb-3">📊 분석할 기록</h2>
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-700">{gameRecords.length}</p>
                  <p className="text-xs text-gray-400">총 세션</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div>
                  <p className="text-2xl font-bold text-gray-700">
                    {new Set(gameRecords.map((r) => r.gameId)).size}
                  </p>
                  <p className="text-xs text-gray-400">게임 종류</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div>
                  <p className="text-2xl font-bold text-yellow-500">
                    ⭐ {gameRecords.reduce((s, r) => s + r.result.starsEarned, 0)}
                  </p>
                  <p className="text-xs text-gray-400">총 별</p>
                </div>
              </div>
            </div>

            <div className="flex-1" />

            <button
              onClick={generate}
              className="w-full py-4 bg-sky-400 hover:bg-sky-500 active:bg-sky-600 text-white font-bold text-lg rounded-2xl shadow-md transition-colors"
            >
              보고서 생성하기
            </button>
          </div>
        )}
      </div>
    );
  }

  // Loading state
  if (state === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        <span className="text-6xl animate-pulse">📝</span>
        <p className="text-lg font-bold text-gray-600 animate-pulse">
          {LOADING_MESSAGES[loadingMsgIdx]}
        </p>
        <p className="text-sm text-gray-400">잠시만 기다려 주세요</p>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="flex-1 flex flex-col p-4 safe-bottom">
        <div className="flex items-center gap-3 py-4">
          <BackButton href="/home" />
          <h1 className="text-2xl font-bold text-gray-700">AI 보고서</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <span className="text-6xl">😢</span>
          <p className="text-lg font-bold text-gray-600">오류가 발생했어요</p>
          <p className="text-sm text-gray-400">{error}</p>
          <button
            onClick={generate}
            className="mt-4 px-6 py-3 bg-sky-400 hover:bg-sky-500 active:bg-sky-600 text-white font-bold rounded-2xl shadow-md transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // Done state
  return (
    <div className="flex flex-col p-4 safe-bottom gap-4 pb-8">
      <div className="flex items-center gap-3 py-2">
        <BackButton href="/home" />
        <h1 className="text-2xl font-bold text-gray-700">AI 보고서</h1>
      </div>

      {report && (
        <>
          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-500 mb-2">📋 전체 요약</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{report.summary}</p>
          </div>

          {/* Game Analysis */}
          {report.gameAnalysis.map((game) => (
            <div key={game.gameId} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getGameIcon(game.gameId)}</span>
                <h2 className="text-sm font-bold text-gray-700">{game.gameName}</h2>
                <span className="ml-auto text-xs text-gray-400">{game.totalSessions}회</span>
              </div>
              {/* Success rate bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>성공률</span>
                  <span>{game.avgSuccessRate}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full transition-all"
                    style={{ width: `${Math.min(game.avgSuccessRate, 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-400 mb-2">평균 ⭐ {game.avgStars}개</div>
              <p className="text-sm text-gray-600 leading-relaxed">{game.insight}</p>
            </div>
          ))}

          {/* Development Trend */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-500 mb-2">📈 발달 추이</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{report.developmentTrend}</p>
          </div>

          {/* Strengths */}
          {report.strengths.length > 0 && (
            <div className="bg-green-50 rounded-2xl shadow-sm p-4">
              <h2 className="text-sm font-bold text-green-700 mb-2">💪 강점</h2>
              <ul className="space-y-1">
                {report.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-green-800 flex gap-2">
                    <span>•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {report.weaknesses.length > 0 && (
            <div className="bg-orange-50 rounded-2xl shadow-sm p-4">
              <h2 className="text-sm font-bold text-orange-700 mb-2">🌱 개선 영역</h2>
              <ul className="space-y-1">
                {report.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-orange-800 flex gap-2">
                    <span>•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div className="bg-blue-50 rounded-2xl shadow-sm p-4">
              <h2 className="text-sm font-bold text-blue-700 mb-2">💡 추천 활동</h2>
              <ol className="space-y-1">
                {report.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-blue-800 flex gap-2">
                    <span className="font-bold">{i + 1}.</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              onClick={() => {
                setState('idle');
                setReport(null);
              }}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 font-bold rounded-2xl transition-colors"
            >
              다시 생성
            </button>
            <p className="text-xs text-gray-400">
              {new Date(report.generatedAt).toLocaleString('ko-KR')} 생성
            </p>
          </div>
        </>
      )}
    </div>
  );
}
