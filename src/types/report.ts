import type { SessionRecord } from './session';
import type { ChildProfile, TherapistSettings } from './profile';
import type { GameId } from './game';

export interface ReportRequest {
  records: SessionRecord[];
  child: ChildProfile | null;
  settings: TherapistSettings;
}

export interface GameAnalysisSection {
  gameId: GameId;
  gameName: string;
  totalSessions: number;
  avgSuccessRate: number;
  avgStars: number;
  insight: string;
}

export interface ReportData {
  summary: string;
  gameAnalysis: GameAnalysisSection[];
  developmentTrend: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  generatedAt: number;
}

export interface ReportResponse {
  success: boolean;
  report?: ReportData;
  error?: string;
}
