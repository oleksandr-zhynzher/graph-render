import type { MatchStatus, SquashPlayer } from '@graph-render/types';

export interface NormalizedSquashMatchMeta {
  readonly stage: string;
  readonly players: readonly [SquashPlayer, SquashPlayer];
  readonly sets: ReadonlyArray<readonly number[]>;
  readonly tiebreaks: ReadonlyArray<readonly number[] | null>;
  readonly status: MatchStatus;
  readonly currentSet: number;
}

export interface SetWins {
  readonly p1: number;
  readonly p2: number;
}
