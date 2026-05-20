import type { NodeData, PositionedNode } from './node';
import type { GraphViewport } from './viewport';

export type * from './bracketAppearance';

export interface SquashPlayer {
  readonly name: string;
  readonly seed?: number | undefined;
  readonly country?: string | undefined;
}

export enum MatchStatus {
  Completed = 'completed',
  Live = 'live',
  Upcoming = 'upcoming',
}

export interface SquashMatchMeta {
  readonly stage?: string | undefined;
  readonly players?: readonly SquashPlayer[] | undefined;
  readonly sets?: ReadonlyArray<readonly number[]> | undefined;
  readonly tiebreaks?: ReadonlyArray<readonly number[] | null> | undefined;
  readonly status?: MatchStatus | undefined;
  readonly currentSet?: number | undefined;
}

export type SquashNodeData = NodeData<unknown, SquashMatchMeta, string>;
export type SquashPositionedNode = PositionedNode<unknown, SquashMatchMeta, string>;

export enum SquashNodeRenderMode {
  Svg = 'svg',
  Html = 'html',
  Export = 'export',
  Server = 'server',
}

export interface StageBounds {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
}

export interface StageView {
  readonly index: number;
  readonly label: string;
  readonly bounds: StageBounds;
  readonly nodeIds: readonly string[];
}

export enum VerticalStagePosition {
  Top = 'top',
  Bottom = 'bottom',
  Center = 'center',
}

export interface StageViewportResult {
  readonly viewport: GraphViewport;
  readonly canPageVertically: boolean;
}
