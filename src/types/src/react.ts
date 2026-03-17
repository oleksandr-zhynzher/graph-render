import { ComponentType, ReactNode } from 'react';
import { NodeData, PositionedNode as CorePositionedNode } from './node';
import { EdgeData, PositionedEdge as CorePositionedEdge, PositionedEdge } from './edge';
import { GraphConfig } from './config';
import { NxGraphInput } from './graph';
import { LayoutOptions } from './layout';
import { RouteEdgesOptions } from './routing';

export interface PathHoverOptions {
  pathKey?: string;
  playerKey?: string;
}

export interface VertexComponentProps<
  TNode extends CorePositionedNode<any, any, any> = CorePositionedNode,
> {
  node: TNode;
  isSelected?: boolean;
  isHovered?: boolean;
  isHoveredIn?: boolean;
  isHoveredOut?: boolean;
  isHoveredBoth?: boolean;
  activePathKey?: string;
  activePathNodeIds?: Set<string>;
  hoverInColor?: string;
  hoverOutColor?: string;
  hoverBothColor?: string;
  onPathHover?: (sourceIndex: number | null, opts?: PathHoverOptions) => void;
  onPathLeave?: () => void;
}

export interface EdgePathProps<TEdge extends PositionedEdge<any, any> = PositionedEdge> {
  edge: TEdge;
  color: string;
  width: number;
  curveEdges: boolean;
  curveStrength: number;
  markerEnd?: string;
  isHovered?: boolean;
  isSelected?: boolean;
  hoverColor: string;
  selectionColor?: string;
  labelColor?: string;
  selectionMarker?: string;
  hoverMarker?: string;
  hoverEnabled: boolean;
  hoverStrokeWidth?: number;
  selectedStrokeWidth?: number;
  hitStrokeWidth?: number;
  onHoverChange?: (hovered: boolean) => void;
  onClick?: () => void;
}

export type VertexComponent<TNode extends CorePositionedNode<any, any, any> = CorePositionedNode> =
  ComponentType<VertexComponentProps<TNode>>;
export type EdgeComponent<TEdge extends PositionedEdge<any, any> = PositionedEdge> = ComponentType<
  EdgePathProps<TEdge>
>;

export interface GraphViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface GraphSelection {
  nodeIds: string[];
  edgeIds: string[];
}

export interface GraphRenderContext<
  TGraph extends NxGraphInput = NxGraphInput,
  TNode extends CorePositionedNode<any, any, any> = CorePositionedNode,
  TEdge extends CorePositionedEdge<any, any> = CorePositionedEdge,
> {
  graph: TGraph;
  nodes: TNode[];
  edges: TEdge[];
  config?: GraphConfig;
  viewport: GraphViewport;
  selection: GraphSelection;
}

export interface GraphHoverMeta {
  viewport: GraphViewport;
  selection: GraphSelection;
  trigger: 'pointer' | 'path';
}

export interface GraphSearchResults {
  nodeIds: string[];
  edgeIds: string[];
}

// FIX: added 'layout' and 'routing' for errors thrown by the built-in
// layout/routing functions (not just user-supplied overrides).
export type GraphErrorPhase = 'layout' | 'layout-override' | 'routing' | 'routing-override';

export interface GraphErrorContext<TGraph extends NxGraphInput = NxGraphInput> {
  graph: TGraph;
  phase: GraphErrorPhase;
}

export interface GraphHandle {
  fitView: (padding?: number) => void;
  centerOnNode: (nodeId: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (zoom: number) => void;
  resetViewport: () => void;
  getViewport: () => GraphViewport;
  setViewport: (
    next:
      | Partial<GraphViewport>
      | ((current: GraphViewport) => Partial<GraphViewport> | GraphViewport)
  ) => void;
  clearSelection: () => void;
}

export type DragState = {
  active: boolean;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

export type GraphControlsPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface GraphProps<
  TGraph extends NxGraphInput = NxGraphInput,
  TNode extends CorePositionedNode<any, any, any> = CorePositionedNode,
  TEdge extends CorePositionedEdge<any, any> = CorePositionedEdge,
  TNodeRecord extends NodeData<any, any, any> = NodeData,
  TEdgeRecord extends EdgeData<any, any> = EdgeData,
> {
  graph: TGraph;
  vertexComponent: VertexComponent<TNode>;
  edgeComponent?: EdgeComponent<TEdge>;
  config?: GraphConfig;
  viewport?: GraphViewport;
  defaultViewport?: Partial<GraphViewport>;
  onViewportChange?: (viewport: GraphViewport) => void;
  fitViewOnMount?: boolean;
  fitViewPadding?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  panEnabled?: boolean;
  zoomEnabled?: boolean;
  pinchZoomEnabled?: boolean;
  keyboardNavigation?: boolean;
  showControls?: boolean;
  controlsPosition?: GraphControlsPosition;
  marqueeSelectionEnabled?: boolean;
  focusedNodeId?: string | null;
  defaultFocusedNodeId?: string | null;
  onFocusedNodeChange?: (nodeId: string | null) => void;
  collapsedNodeIds?: string[];
  defaultCollapsedNodeIds?: string[];
  onCollapsedNodeIdsChange?: (nodeIds: string[]) => void;
  toggleCollapseOnNodeDoubleClick?: boolean;
  hiddenNodeIds?: string[];
  onNodeExpand?: (nodeId: string) => void | Promise<void>;
  onNodeCollapse?: (nodeId: string) => void;
  searchQuery?: string;
  hideUnmatchedSearch?: boolean;
  searchPredicate?: (node: TNodeRecord, query: string) => boolean;
  highlightedNodeIds?: string[];
  highlightedEdgeIds?: string[];
  highlightColor?: string;
  highlightStrategy?: (context: {
    nodes: TNodeRecord[];
    edges: TEdgeRecord[];
    query: string;
    matchedNodeIds: string[];
    matchedEdgeIds: string[];
  }) => Partial<GraphSearchResults>;
  onSearchResultsChange?: (results: GraphSearchResults) => void;
  selectedNodeIds?: string[];
  selectedEdgeIds?: string[];
  defaultSelectedNodeIds?: string[];
  defaultSelectedEdgeIds?: string[];
  onSelectionChange?: (selection: GraphSelection) => void;
  selectionMode?: 'single' | 'multiple';
  nodeSelectionEnabled?: boolean;
  edgeSelectionEnabled?: boolean;
  selectionColor?: string;
  edgeSelectionColor?: string;
  layoutNodesOverride?: (options: LayoutOptions) => TNode[];
  routeEdgesOverride?: (
    nodes: TNode[],
    edges: TEdgeRecord[],
    options?: RouteEdgesOptions
  ) => TEdge[];
  renderBackground?: (context: GraphRenderContext<TGraph, TNode, TEdge>) => ReactNode;
  renderOverlay?: (context: GraphRenderContext<TGraph, TNode, TEdge>) => ReactNode;
  onError?: (error: Error, context: GraphErrorContext<TGraph>) => void;
  onNodeHoverChange?: (node: TNode, hovered: boolean, meta: GraphHoverMeta) => void;
  onEdgeHoverChange?: (edge: TEdge, hovered: boolean, meta: GraphHoverMeta) => void;
  onNodeClick?: (node: TNode) => void;
  onEdgeClick?: (edge: TEdge) => void;
}
