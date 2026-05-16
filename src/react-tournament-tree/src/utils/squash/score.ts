import type { MatchStatus } from '@graph-render/types';
import type { SetWins } from '../../models/squash';

export type { SetWins };

export const getDisplayScores = (
  sets: number[][],
  tiebreaks: (number[] | null)[],
  playerIndex: number
): string[] => {
  return sets.map((setScores, setIndex) => {
    const score = setScores[playerIndex];

    if (!Number.isFinite(score)) {
      return '—';
    }

    const tiebreakValue = tiebreaks[setIndex]?.[playerIndex];
    if (typeof tiebreakValue === 'number' && Number.isFinite(tiebreakValue) && tiebreakValue > 0) {
      return `${score}(${tiebreakValue})`;
    }

    return String(score);
  });
};

export const getScoreSegments = (
  sets: number[][],
  tiebreaks: (number[] | null)[],
  playerIndex: number
): string[] => {
  const segments = getDisplayScores(sets, tiebreaks, playerIndex);
  return segments.length ? segments : ['—'];
};

export const getScoreGroupWidth = (
  segmentCount: number,
  segmentWidth: number,
  segmentGap: number
): number => {
  if (segmentCount <= 0) {
    return segmentWidth;
  }

  return segmentCount * segmentWidth + Math.max(0, segmentCount - 1) * segmentGap;
};

export const getSetWins = (sets: number[][], status: MatchStatus, currentSet: number): SetWins => {
  return sets.reduce<SetWins>(
    (acc, [a, b], index) => {
      if (status === 'live' && index === currentSet) {
        return acc;
      }

      if (a > b) {
        acc.p1 += 1;
      } else if (b > a) {
        acc.p2 += 1;
      }

      return acc;
    },
    { p1: 0, p2: 0 }
  );
};

export const getCompletedWinnerIndex = (setWins: SetWins, status: MatchStatus): number | null => {
  if (status !== 'completed' || setWins.p1 === setWins.p2) {
    return null;
  }

  return setWins.p1 > setWins.p2 ? 0 : 1;
};
