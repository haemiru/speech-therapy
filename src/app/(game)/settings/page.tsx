'use client';

import { useState, useCallback } from 'react';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Modal } from '@/components/ui/Modal';
import { useProfileStore } from '@/stores/useProfileStore';
import { MOUTH_OPEN_THRESHOLD, LIP_PUCKER_THRESHOLD, HOLD_DURATION_MS, DEFAULT_TOTAL_ROUNDS } from '@/constants/thresholds';

function getSensitivityLabel(value: number, low: number, high: number): string {
  const range = high - low;
  const ratio = (value - low) / range;
  if (ratio <= 0.33) return '쉬움';
  if (ratio <= 0.66) return '보통';
  return '어려움';
}

const ROUND_OPTIONS = [3, 5, 7] as const;

const GAME_TABS = [
  { id: 'mouth-opening', label: '👄 입 운동' },
  { id: 'sound-balloon', label: '🎈 소리 열기구' },
  { id: 'repeat-speech', label: '🗣️ 따라 말하기' },
] as const;

type GameTabId = (typeof GAME_TABS)[number]['id'];

export default function SettingsPage() {
  const { settings, updateSettings, reset } = useProfileStore();
  const [showResetModal, setShowResetModal] = useState(false);
  const [activeTab, setActiveTab] = useState<GameTabId>('mouth-opening');

  const handleReset = useCallback(() => {
    reset();
    setShowResetModal(false);
  }, [reset]);

  return (
    <div className="flex-1 flex flex-col p-4 safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 py-2 mb-4">
        <BackButton href="/home" />
        <h1 className="text-2xl font-bold text-gray-700">설정</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* 게임 탭 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {GAME_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 게임별 설정 */}
        {activeTab === 'mouth-opening' && (
          <section>
            <div className="bg-white rounded-2xl shadow-md p-4 space-y-5">
              {/* 입 벌리기 감도 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">입 벌리기 감도</span>
                  <span className="text-xs font-bold text-primary">
                    {getSensitivityLabel(settings.mouthOpenThreshold, 0.3, 0.9)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.3}
                  max={0.9}
                  step={0.1}
                  value={settings.mouthOpenThreshold}
                  onChange={(e) => updateSettings({ mouthOpenThreshold: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>쉬움</span>
                  <span>어려움</span>
                </div>
              </div>

              {/* 입 오므리기 감도 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">입 오므리기 감도</span>
                  <span className="text-xs font-bold text-primary">
                    {getSensitivityLabel(settings.lipPuckerThreshold, 0.2, 0.8)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={0.8}
                  step={0.1}
                  value={settings.lipPuckerThreshold}
                  onChange={(e) => updateSettings({ lipPuckerThreshold: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>쉬움</span>
                  <span>어려움</span>
                </div>
              </div>

              {/* 유지 시간 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">유지 시간</span>
                  <span className="text-xs font-bold text-primary">
                    {(settings.holdDurationMs / 1000).toFixed(1)}초
                  </span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={1000}
                  step={100}
                  value={settings.holdDurationMs}
                  onChange={(e) => updateSettings({ holdDurationMs: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>0.3초</span>
                  <span>1.0초</span>
                </div>
              </div>

              {/* 라운드 수 */}
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">라운드 수</span>
                <div className="flex gap-3">
                  {ROUND_OPTIONS.map((n) => (
                    <Button
                      key={n}
                      variant={settings.totalRounds === n ? 'primary' : 'secondary'}
                      size="sm"
                      className="flex-1"
                      onClick={() => updateSettings({ totalRounds: n })}
                    >
                      {n}라운드
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'sound-balloon' && (
          <section>
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center min-h-[160px]">
              <span className="text-4xl mb-3">🎈</span>
              <p className="text-sm text-gray-400 font-medium">준비 중이에요!</p>
            </div>
          </section>
        )}

        {activeTab === 'repeat-speech' && (
          <section>
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center min-h-[160px]">
              <span className="text-4xl mb-3">🗣️</span>
              <p className="text-sm text-gray-400 font-medium">준비 중이에요!</p>
            </div>
          </section>
        )}

        {/* 소리 & 진동 섹션 */}
        <section>
          <h2 className="text-lg font-bold text-gray-600 mb-3">🔊 소리 &amp; 진동</h2>
          <div className="bg-white rounded-2xl shadow-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">효과음</span>
              <Toggle
                label="효과음"
                checked={settings.soundEnabled}
                onChange={(v) => updateSettings({ soundEnabled: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">진동</span>
              <Toggle
                label="진동"
                checked={settings.hapticEnabled}
                onChange={(v) => updateSettings({ hapticEnabled: v })}
              />
            </div>
          </div>
        </section>

        {/* 초기화 버튼 */}
        <div className="pt-2 pb-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowResetModal(true)}
          >
            기본값으로 초기화
          </Button>
        </div>
      </div>

      {/* 초기화 확인 모달 */}
      <Modal open={showResetModal} onClose={() => setShowResetModal(false)}>
        <div className="text-center space-y-4">
          <p className="text-lg font-bold text-gray-700">설정을 초기화할까요?</p>
          <p className="text-sm text-gray-500">
            모든 난이도와 소리 설정이 기본값으로 돌아갑니다.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowResetModal(false)}
            >
              취소
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleReset}
            >
              초기화
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
