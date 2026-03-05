import { NextResponse } from 'next/server';
import type { ReportRequest, ReportData, GameAnalysisSection } from '@/types/report';
import type { SessionRecord } from '@/types/session';
import type { GameId } from '@/types/game';

export const dynamic = 'force-dynamic';


const GAME_NAMES: Record<string, string> = {
  'mouth-opening': '입 운동',
  'tongue-exercises': '혀 운동',
  'sound-balloon': '소리 열기구',
  'follow-speech': '따라 말하기',
};

interface GameStats {
  gameId: GameId;
  gameName: string;
  totalSessions: number;
  avgSuccessRate: number;
  avgStars: number;
  maxPeakValue: number;
  recentTrend: number[];
}

function aggregateByGame(records: SessionRecord[]): GameStats[] {
  const gameGroups = new Map<string, SessionRecord[]>();
  for (const r of records) {
    if (!GAME_NAMES[r.gameId]) continue;
    const list = gameGroups.get(r.gameId) ?? [];
    list.push(r);
    gameGroups.set(r.gameId, list);
  }

  const stats: GameStats[] = [];
  for (const [gameId, recs] of gameGroups) {
    const sorted = [...recs].sort((a, b) => a.timestamp - b.timestamp);
    const totalSessions = sorted.length;
    const avgSuccessRate =
      sorted.reduce((sum, r) => sum + r.result.successCount / r.result.totalRounds, 0) /
      totalSessions;
    const avgStars =
      sorted.reduce((sum, r) => sum + r.result.starsEarned, 0) / totalSessions;
    const maxPeakValue = Math.max(...sorted.map((r) => r.result.peakValue));
    const recent = sorted.slice(-5).map((r) => r.result.successCount / r.result.totalRounds);

    stats.push({
      gameId: gameId as GameId,
      gameName: GAME_NAMES[gameId] ?? gameId,
      totalSessions,
      avgSuccessRate: Math.round(avgSuccessRate * 100),
      avgStars: Math.round(avgStars * 10) / 10,
      maxPeakValue: Math.round(maxPeakValue * 100) / 100,
      recentTrend: recent.map((v) => Math.round(v * 100)),
    });
  }
  return stats;
}

function buildPrompt(req: ReportRequest): string {
  const stats = aggregateByGame(req.records);
  const totalSessions = req.records.filter((r) => GAME_NAMES[r.gameId]).length;

  const gameSection = stats
    .map(
      (s) =>
        `- ${s.gameName}: 총 ${s.totalSessions}회, 평균 성공률 ${s.avgSuccessRate}%, 평균 별 ${s.avgStars}개, 최고값 ${s.maxPeakValue}, 최근5회 성공률 [${s.recentTrend.join(', ')}]%`
    )
    .join('\n');

  const childInfo = req.child
    ? `아동 이름: ${req.child.name}, 나이: ${req.child.age}세`
    : '아동 정보 미입력';

  return `당신은 발달장애 아동 언어치료 전문가입니다.
아래 게임 기록 데이터를 분석하여 임상 스타일 보고서를 JSON 형식으로 작성해주세요.

## 아동 정보
${childInfo}

## 총 세션 수
${totalSessions}회

## 게임별 통계
${gameSection}

## 치료사 설정값
- 입 벌리기 감도: ${req.settings.mouthOpenThreshold}
- 입 오므리기 감도: ${req.settings.lipPuckerThreshold}
- 혀 운동 감도: ${req.settings.tongueThreshold}
- 소리 감도: ${req.settings.soundBalloonThreshold}
- 따라 말하기 유사도 기준: ${req.settings.followSpeechThreshold}

## 요청사항
1. 긍정적이고 격려하는 톤으로 작성
2. 강점을 먼저, 개선영역은 부드럽게
3. 추천 활동은 가정에서 할 수 있는 구체적인 것
4. 한국어로 작성

## 출력 형식 (JSON만 출력, 마크다운 코드펜스 없이)
{
  "summary": "전체 요약 (2-3문장)",
  "gameAnalysis": [
    {
      "gameId": "mouth-opening",
      "gameName": "입 운동",
      "totalSessions": 10,
      "avgSuccessRate": 80,
      "avgStars": 2.5,
      "insight": "게임별 분석 코멘트"
    }
  ],
  "developmentTrend": "발달 추이 설명",
  "strengths": ["강점1", "강점2"],
  "weaknesses": ["개선영역1"],
  "recommendations": ["추천활동1", "추천활동2"]
}`;
}

function parseReportFromText(text: string): Omit<ReportData, 'generatedAt'> | null {
  // Remove markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    return {
      summary: parsed.summary ?? '',
      gameAnalysis: (parsed.gameAnalysis ?? []).map((g: GameAnalysisSection) => ({
        gameId: g.gameId,
        gameName: g.gameName,
        totalSessions: g.totalSessions,
        avgSuccessRate: g.avgSuccessRate,
        avgStars: g.avgStars,
        insight: g.insight,
      })),
      developmentTrend: parsed.developmentTrend ?? '',
      strengths: parsed.strengths ?? [],
      weaknesses: parsed.weaknesses ?? [],
      recommendations: parsed.recommendations ?? [],
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'API 키가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    const body: ReportRequest = await request.json();

    if (!body.records || body.records.length === 0) {
      return NextResponse.json(
        { success: false, error: '분석할 기록이 없습니다.' },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(body);

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      throw new Error(`Gemini API ${geminiRes.status}: ${errBody.slice(0, 200)}`);
    }

    const geminiData = await geminiRes.json();
    const parts = geminiData?.candidates?.[0]?.content?.parts ?? [];
    const text = parts
      .filter((p: { text?: string }) => p.text)
      .map((p: { text: string }) => p.text)
      .join('');

    const parsed = parseReportFromText(text);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: '보고서 생성 결과를 파싱할 수 없습니다.' },
        { status: 500 }
      );
    }

    const report: ReportData = {
      ...parsed,
      generatedAt: Date.now(),
    };

    return NextResponse.json({ success: true, report });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    console.error('Report generation error:', message);
    return NextResponse.json(
      { success: false, error: `보고서 생성 중 오류: ${message}` },
      { status: 500 }
    );
  }
}
