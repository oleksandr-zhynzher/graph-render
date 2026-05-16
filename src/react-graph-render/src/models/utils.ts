import type {
  EdgeData,
  EdgeId,
  GraphConfig,
  LayoutOptions,
  NodeData,
  NormalizedGraphConfig,
  NxGraphInput,
  PathTraversalResult,
  PositionedEdge,
  PositionedNode,
  RouteEdgesOptions,
} from '@graph-render/types';
import type { GraphModelErrorHandler } from './graph';

// ── viewport ────────────────────────────────────────────────────────────────

export interface GraphBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

// ── pathHighlight ────────────────────────────────────────────────────────────

export interface FocusedPath {
  nodeId: string;
  sourceIndex: number | null;
  pathKey?: string;
}

// ── pointer ──────────────────────────────────────────────────────────────────

export type PointerState = { x: number; y: number };

export type PinchState = {
  active: boolean;
  startDistance: number;
  startZoom: number;
  worldX: number;
  worldY: number;
};

export type SelectionBox = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

// ── graphHoverState ──────────────────────────────────────────────────────────

export type HoveredNodeState = { in: boolean; out: boolean };

export type HoveredNodeStateParams = {
  hoverHighlight: boolean;
  focusedPath: unknown;
  hoveredEdgeId: EdgeId | null;
  hoveredNodeId: string | null;
  edgeById: Map<EdgeId, PositionedEdge>;
  edgesByNodeId: Map<string, PositionedEdge[]>;
  pathHighlight: PathTraversalResult | null;
};

// ── graphHoverMaps ───────────────────────────────────────────────────────────

export type PositionedHoverNode = {
  id: string;
  position: { x: number; y: number };
  meta?: Record<string, unknown>;
};

// ── columns ──────────────────────────────────────────────────────────────────

export interface NodeColumn<TNode extends PositionedNode = PositionedNode> {
  centerX: number;
  nodes: TNode[];
}

// ── keyboardNavigation ───────────────────────────────────────────────────────

export type KeyboardDirection = 'left' | 'right' | 'up' | 'down';

// ── graphModelLayout ─────────────────────────────────────────────────────────

export interface ResolvePositionedNodesOptions {
  allowDegradedGraph: boolean;
  graph: NxGraphInput;
  layoutNodesOverride?: (options: LayoutOptions) => PositionedNode[];
  layoutOptions: LayoutOptions;
  onError?: GraphModelErrorHandler;
  visibleNodes: NodeData[];
}

// ── graphModelOptions ────────────────────────────────────────────────────────

export interface GraphLayoutOptionsInput {
  config: NormalizedGraphConfig;
  edges: EdgeData[];
  mergedTheme: NonNullable<GraphConfig['theme']>;
  nodes: NodeData[];
}

// ── graphModelRouting ────────────────────────────────────────────────────────

export interface ResolvePositionedEdgesOptions {
  allowDegradedGraph: boolean;
  edgeRoutingOptions: RouteEdgesOptions;
  graph: NxGraphInput;
  onError?: GraphModelErrorHandler;
  positionedNodes: PositionedNode[];
  routeEdgesOverride?: (
    nodes: PositionedNode[],
    edges: EdgeData[],
    options?: RouteEdgesOptions
  ) => PositionedEdge[];
  visibleEdges: EdgeData[];
}

// ── graphNodeFrame ───────────────────────────────────────────────────────────

export interface GraphNodeFrameStateOptions {
  isSelected: boolean;
  isHighlighted: boolean;
  highlightColor: string;
  selectionColor: string;
  nodeBorderColor?: string;
  nodeBorderWidth: number;
  hoverNodeBorderColor: string;
  hoverNodeBothColor: string;
  hoverNodeInColor: string;
  hoverNodeOutColor: string;
  hoverNodeHighlight: boolean;
  isHoveredIn: boolean;
  isHoveredOut: boolean;
}

// ── pathKeys ─────────────────────────────────────────────────────────────────

export type NodeWithPathMeta = {
  id: string;
  meta?: Record<string, unknown>;
};

// ── searchMatching ───────────────────────────────────────────────────────────

export interface HighlightContext<
  TNode extends NodeData = NodeData,
  TEdge extends EdgeData = EdgeData,
> {
  edges: TEdge[];
  matchedEdgeIds: string[];
  matchedNodeIds: string[];
  nodes: TNode[];
  query: string;
}

// ── selection ────────────────────────────────────────────────────────────────

export type Rect = { x: number; y: number; width: number; height: number };
