'use client';

import { useState, useCallback } from 'react';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PuppyAvatar } from '@/components/puppy/PuppyAvatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useProfileStore } from '@/stores/useProfileStore';
import { usePuppyStore } from '@/stores/usePuppyStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { getStageForStars, getNextStage, PUPPY_STAGES } from '@/constants/puppy';

export default function ProfilePage() {
  const { child, setChild } = useProfileStore();
  const { totalStars, currentStage, name, setName, createdAt } = usePuppyStore();
  const { records } = useHistoryStore();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(name);
  const [editingChild, setEditingChild] = useState(false);
  const [childNameInput, setChildNameInput] = useState(child?.name ?? '');
  const [childAgeInput, setChildAgeInput] = useState(child?.age?.toString() ?? '');

  const stageDef = getStageForStars(totalStars);
  const nextStage = getNextStage(currentStage);

  const progressValue = nextStage
    ? (totalStars - stageDef.requiredStars) / (nextStage.requiredStars - stageDef.requiredStars)
    : 1;

  const totalSessions = records.length;
  const daysSinceStart = Math.max(1, Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24)));

  const handleSavePuppyName = useCallback(() => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      setName(trimmed);
    }
    setEditingName(false);
  }, [nameInput, setName]);

  const handleSaveChild = useCallback(() => {
    const trimmedName = childNameInput.trim();
    const age = parseInt(childAgeInput);
    if (trimmedName && age >= 1 && age <= 15) {
      setChild({ name: trimmedName, age, createdAt: child?.createdAt ?? Date.now() });
    }
    setEditingChild(false);
  }, [childNameInput, childAgeInput, setChild, child]);

  return (
    <div className="flex flex-col p-4 safe-bottom gap-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 py-2">
        <BackButton href="/home" />
        <h1 className="text-2xl font-bold text-gray-700">프로필</h1>
      </div>

      {/* 아이 프로필 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-500">👶 아이 정보</h2>
          <button
            className="text-xs text-sky-500 font-medium"
            onClick={() => {
              setChildNameInput(child?.name ?? '');
              setChildAgeInput(child?.age?.toString() ?? '');
              setEditingChild(true);
            }}
          >
            {child ? '수정' : '등록하기'}
          </button>
        </div>
        {child ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center text-2xl">
              👶
            </div>
            <div>
              <p className="text-lg font-bold text-gray-700">{child.name}</p>
              <p className="text-sm text-gray-400">{child.age}세</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            아이 정보를 등록하면 맞춤 관리가 가능해요!
          </p>
        )}
      </div>

      {/* 뭉치 프로필 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-500">🐾 나의 강아지</h2>
          <button
            className="text-xs text-sky-500 font-medium"
            onClick={() => {
              setNameInput(name);
              setEditingName(true);
            }}
          >
            이름 변경
          </button>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <PuppyAvatar stage={currentStage} size="md" />
          <div className="flex-1">
            <p className="text-lg font-bold text-gray-700">{name}</p>
            <p className="text-sm text-gray-400">{stageDef.name} · {stageDef.description}</p>
          </div>
        </div>

        {/* 성장 단계 */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-500">성장 진행</span>
            <span className="text-xs text-gray-400">
              ⭐ {totalStars}개
              {nextStage && ` / ${nextStage.requiredStars}개`}
            </span>
          </div>
          <ProgressBar value={progressValue} color="yellow" height="md" />
          <div className="flex justify-between mt-3">
            {PUPPY_STAGES.map((s) => (
              <div
                key={s.stage}
                className={`flex flex-col items-center ${
                  s.stage <= currentStage ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <span className="text-lg">{s.emoji}</span>
                <span className="text-[10px] text-gray-500">{s.requiredStars}⭐</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 활동 요약 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-500 mb-4">📊 활동 요약</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-sky-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-sky-600">{totalSessions}</p>
            <p className="text-[10px] text-gray-400 mt-1">총 세션</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-yellow-500">{totalStars}</p>
            <p className="text-[10px] text-gray-400 mt-1">모은 별</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-purple-500">{daysSinceStart}</p>
            <p className="text-[10px] text-gray-400 mt-1">함께한 날</p>
          </div>
        </div>
      </div>

      {/* 뭉치 이름 변경 모달 */}
      <Modal open={editingName} onClose={() => setEditingName(false)}>
        <div className="space-y-4">
          <p className="text-lg font-bold text-gray-700 text-center">강아지 이름 변경</p>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={8}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-lg font-medium focus:outline-none focus:border-sky-400"
            placeholder="이름 입력 (최대 8자)"
          />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setEditingName(false)}>
              취소
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleSavePuppyName}>
              저장
            </Button>
          </div>
        </div>
      </Modal>

      {/* 아이 정보 등록/수정 모달 */}
      <Modal open={editingChild} onClose={() => setEditingChild(false)}>
        <div className="space-y-4">
          <p className="text-lg font-bold text-gray-700 text-center">아이 정보</p>
          <div>
            <label className="text-sm text-gray-500 block mb-1">이름</label>
            <input
              type="text"
              value={childNameInput}
              onChange={(e) => setChildNameInput(e.target.value)}
              maxLength={10}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg font-medium focus:outline-none focus:border-sky-400"
              placeholder="아이 이름"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">나이</label>
            <input
              type="number"
              value={childAgeInput}
              onChange={(e) => setChildAgeInput(e.target.value)}
              min={1}
              max={15}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg font-medium focus:outline-none focus:border-sky-400"
              placeholder="나이 (세)"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setEditingChild(false)}>
              취소
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleSaveChild}>
              저장
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
