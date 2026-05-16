import type { GraphConfig } from './config';
import type { NxGraphInput } from './graph';
import type { GraphViewport, VertexComponent } from './react';
import type { NodeData, PositionedNode } from './node';

export interface SquashPlayer {
  name: string;
  seed?: number;
  country?: string;
}

export type MatchStatus = 'completed' | 'live' | 'upcoming';

export interface SquashMatchMeta {
  stage?: string;
  players?: SquashPlayer[];
  sets?: number[][];
  tiebreaks?: (number[] | null)[];
  status?: MatchStatus;
  currentSet?: number;
}

export type SquashNodeData = NodeData<unknown, SquashMatchMeta, string>;
export type SquashPositionedNode = PositionedNode<unknown, SquashMatchMeta, string>;

export type SquashNodeRenderMode = 'svg' | 'html' | 'export' | 'server';

export type StageBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

export type StageView = {
  index: number;
  label: string;
  bounds: StageBounds;
  nodeIds: string[];
};

export type VerticalStagePosition = 'top' | 'bottom' | 'center';

export type StageViewportResult = {
  viewport: GraphViewport;
  canPageVertically: boolean;
};

export interface TournamentBracketProps {
  graph: NxGraphInput;
  config?: Partial<GraphConfig>;
  defaultViewport?: Partial<GraphViewport>;
  vertexComponent?: VertexComponent;
  nodeRenderMode?: SquashNodeRenderMode;
  title?: string;
  badgeText?: string;
  showToolbar?: boolean;
  showViewportControls?: boolean;
  defaultNavigationMode?: boolean;
  panEnabled?: boolean;
  zoomEnabled?: boolean;
  pinchZoomEnabled?: boolean;
  compact?: boolean;
  onMatchClick?: (node: SquashPositionedNode) => void;
  onInvalidNode?: (nodeId: string, error: Error) => void;
}
