import type {
  EdgeData,
  GraphHandle,
  GraphProps,
  GraphSearchResults,
  GraphSelection,
  GraphViewport,
  NodeData,
  NxGraphInput,
  PositionedEdge,
  PositionedNode,
  Size,
} from '@graph-render/types';
import type { MutableRefObject } from 'react';
import type { FocusedPath } from './utils';

// ── useGraphCollapse ─────────────────────────────────────────────────────────

export interface UseGraphCollapseOptions {
  collapsedNodeIds?: string[];
  defaultCollapsedNodeIds?: string[];
  onCollapsedNodeIdsChange?: (nodeIds: string[]) => void;
}

export interface UseGraphCollapseResult {
  collapsedIds: string[];
  collapsedNodeSet: Set<string>;
  pendingExpansionNodeSet: Set<string>;
  updateCollapsedNodeIds: (next: string[] | ((current: string[]) => string[])) => void;
  setPendingExpansionNodeIds: React.Dispatch<React.SetStateAction<string[]>>;
}

// ── useGraphCollapseHandlers ─────────────────────────────────────────────────

export type GraphErrorHandler = GraphProps<
  NxGraphInput,
  PositionedNode,
  PositionedEdge,
  NodeData,
  EdgeData
>['onError'];

export interface UseGraphCollapseHandlersOptions {
  childNodeIdsByParent: Map<string, string[]>;
  collapsedNodeSet: Set<string>;
  graph: NxGraphInput;
  onError: GraphErrorHandler;
  onNodeCollapse: ((nodeId: string) => void) | undefined;
  onNodeExpand: ((nodeId: string) => void | Promise<void>) | undefined;
  pendingExpansionNodeSet: Set<string>;
  setPendingExpansionNodeIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleCollapseOnNodeDoubleClick: boolean;
  updateCollapsedNodeIds: (next: string[] | ((current: string[]) => string[])) => void;
}

// ── useGraphHoverHandlers ────────────────────────────────────────────────────

export type HoverMeta = {
  selection: GraphSelection;
  trigger: 'pointer' | 'path';
  viewport: GraphViewport;
};

export interface UseGraphHoverHandlersOptions {
  hoverHighlight: boolean;
  onEdgeHoverChange:
    | ((edge: PositionedEdge, hovered: boolean, meta: HoverMeta) => void)
    | undefined;
  onNodeHoverChange:
    | ((node: PositionedNode, hovered: boolean, meta: HoverMeta) => void)
    | undefined;
  positionedEdgeMap: Map<string, PositionedEdge>;
  positionedNodeMap: Map<string, PositionedNode>;
  selection: GraphSelection;
  setFocusedPath: React.Dispatch<React.SetStateAction<FocusedPath | null>>;
  setHoveredEdgeId: React.Dispatch<React.SetStateAction<string | null>>;
  setHoveredNodeId: React.Dispatch<React.SetStateAction<string | null>>;
  viewport: GraphViewport;
}

// ── useGraphKeyboardNavigation ───────────────────────────────────────────────

export interface UseGraphKeyboardNavigationOptions {
  centerOnNode: (nodeId: string) => void;
  fitView: () => void;
  focusedNodeId: string | null;
  handleNodeSelection: (node: PositionedNode) => void;
  keyboardNavigation: boolean;
  positionedNodeMap: Map<string, PositionedNode>;
  positionedNodes: PositionedNode[];
  setFocusedPath: React.Dispatch<React.SetStateAction<FocusedPath | null>>;
  updateFocusedNode: (nodeId: string | null) => void;
  updateSelection: (next: GraphSelection | ((current: GraphSelection) => GraphSelection)) => void;
  updateViewport: GraphHandle['setViewport'];
  zoomStep: number;
}

// ── useGraphNodeMeasurement ──────────────────────────────────────────────────

export interface UseGraphNodeMeasurementOptions {
  node: PositionedNode;
  width: number;
  height: number;
  onNodeMeasure?: (nodeId: string, size: Size) => void;
}

// ── useGraphPointerInteractions ──────────────────────────────────────────────

export interface UseGraphPointerInteractionsOptions {
  getViewportDimensions: () => { width: number; height: number };
  marqueeSelectionEnabled: boolean;
  panEnabled: boolean;
  pinchZoomEnabled: boolean;
  positionedEdges: PositionedEdge[];
  positionedNodes: PositionedNode[];
  safeMaxZoom: number;
  safeMinZoom: number;
  selectionMode: 'single' | 'multiple';
  svgRef: React.RefObject<SVGSVGElement | null>;
  translateExtent: [[number, number], [number, number]] | undefined;
  updateSelection: (next: GraphSelection | ((current: GraphSelection) => GraphSelection)) => void;
  updateViewport: GraphHandle['setViewport'];
  viewport: GraphViewport;
  zoomEnabled: boolean;
}

// ── useGraphSearchState ──────────────────────────────────────────────────────

export interface UseGraphSearchStateOptions<
  TNode extends NodeData = NodeData,
  TEdge extends EdgeData = EdgeData,
> {
  nodes: TNode[];
  edges: TEdge[];
  collapsedIds: string[];
  hiddenNodeIds?: string[];
  searchQuery?: string;
  hideUnmatchedSearch?: boolean;
  searchPredicate?: (node: TNode, query: string) => boolean;
  highlightedNodeIds?: string[];
  highlightedEdgeIds?: string[];
  highlightStrategy?: (context: {
    nodes: TNode[];
    edges: TEdge[];
    query: string;
    matchedNodeIds: string[];
    matchedEdgeIds: string[];
  }) => Partial<GraphSearchResults>;
  onSearchResultsChange?: (results: GraphSearchResults) => void;
}

// ── useGraphSelectionHandlers ────────────────────────────────────────────────

export interface UseGraphSelectionHandlersOptions {
  edgeSelectionEnabled: boolean;
  nodeSelectionEnabled: boolean;
  onEdgeClick: ((edge: PositionedEdge) => void) | undefined;
  onNodeClick: ((node: PositionedNode) => void) | undefined;
  selectionMode: 'single' | 'multiple';
  updateFocusedNode: (nodeId: string | null) => void;
  updateSelection: (next: GraphSelection | ((current: GraphSelection) => GraphSelection)) => void;
}

// ── useGraphViewportController ───────────────────────────────────────────────

export interface UseGraphViewportControllerOptions {
  cfg: import('@graph-render/types').NormalizedGraphConfig;
  fitViewOnMount: boolean;
  fitViewPadding: number;
  graph: NxGraphInput;
  positionedEdges: PositionedEdge[];
  positionedNodeMap: Map<string, PositionedNode>;
  positionedNodes: PositionedNode[];
  ref: React.ForwardedRef<GraphHandle>;
  safeMaxZoom: number;
  safeMinZoom: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
  updateSelection: (next: GraphSelection | ((current: GraphSelection) => GraphSelection)) => void;
  updateViewport: GraphHandle['setViewport'];
  viewport: GraphViewport;
  zoomStep: number;
}

// ── useGraphViewState ────────────────────────────────────────────────────────

export interface UseGraphViewStateOptions {
  controlledViewport: GraphViewport | undefined;
  defaultViewport: Partial<GraphViewport> | undefined;
  safeMinZoom: number;
  safeMaxZoom: number;
  onViewportChange: ((viewport: GraphViewport) => void) | undefined;
  selectedNodeIds: string[] | undefined;
  selectedEdgeIds: string[] | undefined;
  defaultSelectedNodeIds: string[] | undefined;
  defaultSelectedEdgeIds: string[] | undefined;
  onSelectionChange: ((selection: GraphSelection) => void) | undefined;
  controlledFocusedNodeId: string | null | undefined;
  defaultFocusedNodeId: string | null;
  onFocusedNodeChange: ((nodeId: string | null) => void) | undefined;
}

export interface UseGraphViewStateResult {
  viewport: GraphViewport;
  viewportRef: MutableRefObject<GraphViewport>;
  selection: GraphSelection;
  selectionRef: MutableRefObject<GraphSelection>;
  focusedNodeId: string | null;
  updateViewport: GraphHandle['setViewport'];
  updateSelection: (next: GraphSelection | ((current: GraphSelection) => GraphSelection)) => void;
  updateFocusedNode: (nodeId: string | null) => void;
}

// ── useGraphWheelZoom ────────────────────────────────────────────────────────

export interface UseGraphWheelZoomOptions {
  getViewportDimensions: () => { width: number; height: number };
  safeMaxZoom: number;
  safeMinZoom: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
  translateExtent: [[number, number], [number, number]] | undefined;
  updateViewport: GraphHandle['setViewport'];
  viewportRef: React.MutableRefObject<GraphViewport>;
  zoomEnabled: boolean;
  zoomStep: number;
}
