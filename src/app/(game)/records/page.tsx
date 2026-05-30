'use client';

import { BackButton } from '@/components/ui/BackButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { usePuppyStore } from '@/stores/usePuppyStore';
import { getStageForStars, getNextStage, PUPPY_STAGES } from '@/constants/puppy';
import { GAMES } from '@/constants/games';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function getGameInfo(gameId: string) {
  return GAMES.find((g) => g.id === gameId);
}

export default function RecordsPage() {
  const { records, streak, getDailyActivities } = useHistoryStore();
  const { totalStars, currentStage, name } = usePuppyStore();

  const stageDef = getStageForStars(totalStars);
  const nextStage = getNextStage(currentStage);
  const dailyActivities = getDailyActivities(7);

  const totalSessions = records.length;

  // 최근 기록 (최신순, 최대 10개)
  const recentRecords = [...records]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  // 성장 진행률
  const progressValue = nextStage
    ? (totalStars - stageDef.requiredStars) /
      (nextStage.requiredStars - stageDef.requiredStars)
    : 1;
  const nextStarsNeeded = nextStage ? nextStage.requiredStars : totalStars;

  // 빈 상태
  if (records.length === 0) {
    return (
      <div className="flex-1 flex flex-col p-4 safe-bottom">
        <div className="flex items-center gap-3 py-4">
          <BackButton href="/home" />
          <h1 className="text-2xl font-bold text-gray-700">나의 기록</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <span className="text-6xl">📋</span>
          <p className="text-lg font-bold text-gray-600">아직 기록이 없어요!</p>
          <p className="text-sm text-gray-400">
            게임을 하면 여기에 기록이 쌓여요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 safe-bottom gap-5">
      {/* Header */}
      <div className="flex items-center gap-3 py-2">
        <BackButton href="/home" />
        <h1 className="text-2xl font-bold text-gray-700">나의 기록</h1>
      </div>

      {/* 요약 통계 */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-bold text-gray-500 mb-3">📊 요약</h2>
        <div className="flex justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-gray-700">{totalSessions}</p>
            <p className="text-xs text-gray-400">총 세션</p>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <p className="text-2xl font-bold text-yellow-500">⭐ {totalStars}</p>
            <p className="text-xs text-gray-400">모은 별</p>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <p className="text-2xl font-bold text-orange-500">🔥 {streak.currentStreak}</p>
            <p className="text-xs text-gray-400">연속일</p>
          </div>
        </div>
      </div>

      {/* 뭉치 성장 */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-bold text-gray-500 mb-3">🐾 {name}의 성장</h2>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{stageDef.emoji}</span>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-gray-700">{stageDef.name}</span>
              <span className="text-xs text-gray-400">⭐ {totalStars}개</span>
            </div>
            <ProgressBar
              value={progressValue}
              color="yellow"
              height="md"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {nextStage
                ? `${nextStarsNeeded}개까지`
                : '최고 단계 달성!'}
            </p>
          </div>
        </div>
      </div>

      {/* 최근 7일 */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-bold text-gray-500 mb-3">📅 최근 7일</h2>
        <div className="grid grid-cols-7 gap-1 text-center">
          {[...dailyActivities].reverse().map((activity) => {
            const dayOfWeek = new Date(activity.date).getDay();
            const hasActivity = activity.sessionsPlayed > 0;
            return (
              <div key={activity.date} className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400">
                  {DAY_LABELS[dayOfWeek]}
                </span>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    hasActivity
                      ? 'bg-sky-400 text-white font-bold'
                      : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  {hasActivity ? '●' : '○'}
                </span>
                {hasActivity && (
                  <span className="text-[10px] text-gray-400 leading-tight">
                    {activity.sessionsPlayed}회 {activity.starsEarned}⭐
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 최근 기록 */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-bold text-gray-500 mb-3">📋 최근 기록</h2>
        <div className="flex flex-col gap-2">
          {recentRecords.map((record) => {
            const game = getGameInfo(record.gameId);
            const dateStr = record.date.slice(5); // MM-DD
            return (
              <div
                key={record.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{game?.icon ?? '🎮'}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-700">
                      {game?.name ?? record.gameId}
                    </p>
                    <p className="text-xs text-gray-400">{dateStr}</p>
                  </div>
                </div>
                <div className="text-sm text-yellow-500">
                  {'⭐'.repeat(record.result.starsEarned)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
