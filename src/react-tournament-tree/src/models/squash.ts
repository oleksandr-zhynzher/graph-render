import type { SquashMatchMeta } from '@graph-render/types';

export type NormalizedSquashMatchMeta = Required<SquashMatchMeta> & {
  players: Required<SquashMatchMeta>['players'] & { length: 2 };
};

export type SetWins = { p1: number; p2: number };
