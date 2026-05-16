import { MatchStatus } from '@graph-render/types';

import type { SetWins } from '../../models/squash';

export const getDisplayScores = (
  sets: ReadonlyArray<readonly number[]>,
  tiebreaks: ReadonlyArray<readonly number[] | null>,
  playerIndex: number
): readonly string[] => {
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
  sets: ReadonlyArray<readonly number[]>,
  tiebreaks: ReadonlyArray<readonly number[] | null>,
  playerIndex: number
): readonly string[] => {
  const segments = getDisplayScores(sets, tiebreaks, playerIndex);
  return segments.length > 0 ? segments : ['—'];
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

export const getSetWins = (
  sets: ReadonlyArray<readonly number[]>,
  status: MatchStatus,
  currentSet: number
): SetWins => {
  return sets.reduce<{ p1: number; p2: number }>(
    (acc, setScores, index) => {
      if (status === MatchStatus.Live && index === currentSet) {
        return acc;
      }
      const a = setScores[0] ?? 0;
      const b = setScores[1] ?? 0;

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
  if (status !== MatchStatus.Completed || setWins.p1 === setWins.p2) {
    return null;
  }

  return setWins.p1 > setWins.p2 ? 0 : 1;
};

export { type SetWins } from '../../models/squash';
