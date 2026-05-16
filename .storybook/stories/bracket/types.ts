import type { NxNodeAttrs } from '@graph-render/types';

export type Stage32 = 'R32' | 'R16' | 'QF' | 'SF' | 'Final';
export type Stage16 = 'R16' | 'QF' | 'SF' | 'Final';

export interface Player {
  readonly name: string;
  readonly seed: number;
  readonly country?: string;
}

export interface MatchMeta<S extends string = Stage16 | Stage32> {
  readonly stage: S;
  readonly players: readonly [Player, Player];
  readonly sets?: ReadonlyArray<readonly [number, number]>;
  readonly score?: string;
}

export interface MatchNode<S extends string = Stage16 | Stage32> extends NxNodeAttrs {
  readonly label: string;
  readonly position?: { readonly x: number; readonly y: number };
  readonly size?: { readonly width: number; readonly height: number };
  readonly meta?: MatchMeta<S>;
}
