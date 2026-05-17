import type { TournamentBracketAppearance } from './bracketAppearance';
import type { GraphConfig } from './config';
import type { NxGraphInput } from './graph';
import type { NodeData, PositionedNode } from './node';
import type { GraphViewport, VertexComponent } from './react';

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

export interface TournamentBracketProps {
  readonly graph: NxGraphInput;
  /**
   * Graph layout, routing, and canvas options (merged with tournament defaults).
   */
  readonly config?: Partial<GraphConfig> | undefined;
  /**
   * Match-card, header, stage-label, frame, color, and typography overrides.
   */
  readonly appearance?: TournamentBracketAppearance | undefined;
  readonly defaultViewport?: Partial<GraphViewport> | undefined;
  readonly vertexComponent?: VertexComponent | undefined;
  readonly nodeRenderMode?: SquashNodeRenderMode | undefined;
  readonly title?: string | undefined;
  readonly badgeText?: string | undefined;
  readonly showToolbar?: boolean | undefined;
  readonly showViewportControls?: boolean | undefined;
  readonly defaultNavigationMode?: boolean | undefined;
  readonly panEnabled?: boolean | undefined;
  readonly zoomEnabled?: boolean | undefined;
  readonly pinchZoomEnabled?: boolean | undefined;
  readonly compact?: boolean | undefined;
  readonly onMatchClick?: ((node: SquashPositionedNode) => void) | undefined;
  readonly onInvalidNode?: ((nodeId: string, error: Error) => void) | undefined;
}
