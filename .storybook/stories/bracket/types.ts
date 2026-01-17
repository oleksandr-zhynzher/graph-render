import { NxNodeAttrs } from '@graph-render/react';

export type Stage32 = 'R32' | 'R16' | 'QF' | 'SF' | 'Final';
export type Stage16 = 'R16' | 'QF' | 'SF' | 'Final';

export interface Player {
  name: string;
  seed: number;
  country?: string;
}

export interface MatchMeta<S extends string = Stage16 | Stage32> {
  stage: S;
  players: [Player, Player];
  sets?: Array<[number, number]>;
  score?: string;
}

export interface MatchNode<S extends string = Stage16 | Stage32> extends NxNodeAttrs {
  label: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  meta?: MatchMeta<S>;
}
