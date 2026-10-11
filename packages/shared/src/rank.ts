import type { LeaderboardEntry, LeaderboardMeResponse } from './leaderboard.js';

export const RATING_DELTAS = {
  WIN: 20,
  LOSS: -15,
  TIE: 2,
} as const;

export function getUtcSeasonString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

export function getRankedLeaderboardKey(season: string): string {
  return `leaderboard:ranked:${season}`;
}

export interface SeasonResult {
  telegramUserId: number;
  season: string;
  finalRating: number;
  finalRank: number | null;
  archivedAt: Date | string;
}

export interface RankStatusResponse {
  season: string;
  battleRating: number;
  rank: number | null;
}

export interface RankedLeaderboardResponse {
  season: string;
  top: LeaderboardEntry[];
  me: LeaderboardMeResponse;
}
