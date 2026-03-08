import { ComponentType, ReactNode } from 'react';
import { PositionedNode as CorePositionedNode } from './node';
import { EdgeData, PositionedEdge as CorePositionedEdge, PositionedEdge } from './edge';
import { GraphConfig } from './config';
import { NxGraphInput } from './graph';
import { LayoutOptions } from './layout';
import { RouteEdgesOptions } from './routing';

export interface PathHoverOptions {
  pathKey?: string;
  playerKey?: string;
}

export interface VertexComponentProps {
  node: CorePositionedNode;
  isSelected?: boolean;
  isHovered?: boolean;
  isHoveredIn?: boolean;
  isHoveredOut?: boolean;
  isHoveredBoth?: boolean;
  hoverInColor?: string;
  hoverOutColor?: string;
  hoverBothColor?: string;
  onPathHover?: (sourceIndex: number | null, opts?: PathHoverOptions) => void;
  onPathLeave?: () => void;
}

export interface EdgePathProps {
  edge: PositionedEdge;
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

export type VertexComponent = ComponentType<VertexComponentProps>;
export type EdgeComponent = ComponentType<EdgePathProps>;

export interface GraphViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface GraphSelection {
  nodeIds: string[];
  edgeIds: string[];
}

export interface GraphRenderContext {
  graph: NxGraphInput;
  nodes: CorePositionedNode[];
  edges: CorePositionedEdge[];
  config?: GraphConfig;
  viewport: GraphViewport;
  selection: GraphSelection;
}

export interface GraphHoverMeta {
  viewport: GraphViewport;
  selection: GraphSelection;
  trigger: 'pointer' | 'path';
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

export type GraphControlsPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface GraphProps {
  graph: NxGraphInput;
  vertexComponent: VertexComponent;
  edgeComponent?: EdgeComponent;
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
  layoutNodesOverride?: (options: LayoutOptions) => CorePositionedNode[];
  routeEdgesOverride?: (
    nodes: CorePositionedNode[],
    edges: EdgeData[],
    options?: RouteEdgesOptions
  ) => CorePositionedEdge[];
  renderBackground?: (context: GraphRenderContext) => ReactNode;
  renderOverlay?: (context: GraphRenderContext) => ReactNode;
  onNodeHoverChange?: (
    node: CorePositionedNode,
    hovered: boolean,
    meta: GraphHoverMeta
  ) => void;
  onEdgeHoverChange?: (
    edge: CorePositionedEdge,
    hovered: boolean,
    meta: GraphHoverMeta
  ) => void;
  onNodeClick?: (node: CorePositionedNode) => void;
  onEdgeClick?: (edge: CorePositionedEdge) => void;
}
