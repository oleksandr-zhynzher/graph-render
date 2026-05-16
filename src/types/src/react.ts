import type { ComponentType, ReactNode } from 'react';

import type { GraphConfig } from './config';
import type { EdgeData, PositionedEdge as CorePositionedEdge, PositionedEdge } from './edge';
import type { NxGraphInput } from './graph';
import type { LayoutOptions } from './layout';
import type { NodeData, PositionedNode as CorePositionedNode } from './node';
import type { RouteEdgesOptions } from './routing';

type AnyNode = CorePositionedNode;
type AnyEdge = CorePositionedEdge;
type AnyNodeData = NodeData;
type AnyEdgeData = EdgeData;

export interface PathHoverOptions {
  readonly pathKey?: string | undefined;
  readonly playerKey?: string | undefined;
}

export interface VertexComponentProps<TNode extends AnyNode = CorePositionedNode> {
  readonly node: TNode;
  readonly isSelected?: boolean | undefined;
  readonly isHovered?: boolean | undefined;
  readonly isHoveredIn?: boolean | undefined;
  readonly isHoveredOut?: boolean | undefined;
  readonly isHoveredBoth?: boolean | undefined;
  readonly activePathKey?: string | undefined;
  readonly activePathNodeIds?: ReadonlySet<string> | undefined;
  readonly hoverInColor?: string | undefined;
  readonly hoverOutColor?: string | undefined;
  readonly hoverBothColor?: string | undefined;
  readonly onPathHover?:
    | ((sourceIndex: number | null, opts?: PathHoverOptions) => void)
    | undefined;
  readonly onPathLeave?: (() => void) | undefined;
}

export interface EdgePathProps<TEdge extends PositionedEdge = PositionedEdge> {
  readonly edge: TEdge;
  readonly color: string;
  readonly width: number;
  readonly curveEdges: boolean;
  readonly curveStrength: number;
  readonly markerEnd?: string | undefined;
  readonly isHovered?: boolean | undefined;
  readonly isSelected?: boolean | undefined;
  readonly hoverColor: string;
  readonly selectionColor?: string | undefined;
  readonly labelColor?: string | undefined;
  readonly selectionMarker?: string | undefined;
  readonly hoverMarker?: string | undefined;
  readonly hoverEnabled: boolean;
  readonly hoverStrokeWidth?: number | undefined;
  readonly selectedStrokeWidth?: number | undefined;
  readonly hitStrokeWidth?: number | undefined;
  readonly onHoverChange?: ((hovered: boolean) => void) | undefined;
  readonly onClick?: (() => void) | undefined;
}

export type VertexComponent<TNode extends AnyNode = CorePositionedNode> = ComponentType<
  VertexComponentProps<TNode>
>;
export type EdgeComponent<TEdge extends PositionedEdge = PositionedEdge> = ComponentType<
  EdgePathProps<TEdge>
>;

export interface GraphViewport {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
}

export interface GraphSelection {
  readonly nodeIds: readonly string[];
  readonly edgeIds: readonly string[];
}

export interface GraphRenderContext<
  TGraph extends NxGraphInput = NxGraphInput,
  TNode extends AnyNode = CorePositionedNode,
  TEdge extends AnyEdge = CorePositionedEdge,
> {
  readonly graph: TGraph;
  readonly nodes: readonly TNode[];
  readonly edges: readonly TEdge[];
  readonly config?: GraphConfig | undefined;
  readonly viewport: GraphViewport;
  readonly selection: GraphSelection;
}

export enum SelectionMode {
  Single = 'single',
  Multiple = 'multiple',
}

export enum GraphHoverTrigger {
  Pointer = 'pointer',
  Path = 'path',
}

export interface GraphHoverMeta {
  readonly viewport: GraphViewport;
  readonly selection: GraphSelection;
  readonly trigger: GraphHoverTrigger;
}

export interface GraphSearchResults {
  readonly nodeIds: readonly string[];
  readonly edgeIds: readonly string[];
}

// FIX: added 'layout' and 'routing' for errors thrown by the built-in
// layout/routing functions (not just user-supplied overrides).
export enum GraphErrorPhase {
  Layout = 'layout',
  LayoutOverride = 'layout-override',
  Routing = 'routing',
  RoutingOverride = 'routing-override',
  Interaction = 'interaction',
}

export interface GraphErrorContext<TGraph extends NxGraphInput = NxGraphInput> {
  readonly graph: TGraph;
  readonly phase: GraphErrorPhase;
}

export interface GraphHandle {
  readonly fitView: (padding?: number) => void;
  readonly centerOnNode: (nodeId: string) => void;
  readonly zoomIn: () => void;
  readonly zoomOut: () => void;
  readonly zoomTo: (zoom: number) => void;
  readonly resetViewport: () => void;
  readonly getViewport: () => GraphViewport;
  readonly setViewport: (
    next:
      | Partial<GraphViewport>
      | ((current: GraphViewport) => Partial<GraphViewport> | GraphViewport)
  ) => void;
  readonly clearSelection: () => void;
}

export interface DragState {
  readonly active: boolean;
  readonly startX: number;
  readonly startY: number;
  readonly originX: number;
  readonly originY: number;
}

export enum GraphControlsPosition {
  TopLeft = 'top-left',
  TopRight = 'top-right',
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right',
}

export interface GraphProps<
  TGraph extends NxGraphInput = NxGraphInput,
  TNode extends AnyNode = CorePositionedNode,
  TEdge extends AnyEdge = CorePositionedEdge,
  TNodeRecord extends AnyNodeData = NodeData,
  TEdgeRecord extends AnyEdgeData = EdgeData,
> {
  readonly graph: TGraph;
  readonly vertexComponent: VertexComponent<TNode>;
  readonly edgeComponent?: EdgeComponent<TEdge> | undefined;
  readonly config?: GraphConfig | undefined;
  readonly viewport?: GraphViewport | undefined;
  readonly defaultViewport?: Partial<GraphViewport> | undefined;
  readonly onViewportChange?: ((viewport: GraphViewport) => void) | undefined;
  readonly fitViewOnMount?: boolean | undefined;
  readonly fitViewPadding?: number | undefined;
  readonly minZoom?: number | undefined;
  readonly maxZoom?: number | undefined;
  readonly zoomStep?: number | undefined;
  /** World-space bounding box `[[minX, minY], [maxX, maxY]]` the user cannot pan outside of. */
  readonly translateExtent?:
    | readonly [readonly [number, number], readonly [number, number]]
    | undefined;
  readonly panEnabled?: boolean | undefined;
  readonly zoomEnabled?: boolean | undefined;
  readonly pinchZoomEnabled?: boolean | undefined;
  readonly keyboardNavigation?: boolean | undefined;
  readonly showControls?: boolean | undefined;
  readonly controlsPosition?: GraphControlsPosition | undefined;
  readonly marqueeSelectionEnabled?: boolean | undefined;
  readonly focusedNodeId?: string | null | undefined;
  readonly defaultFocusedNodeId?: string | null | undefined;
  readonly onFocusedNodeChange?: ((nodeId: string | null) => void) | undefined;
  readonly collapsedNodeIds?: readonly string[] | undefined;
  readonly defaultCollapsedNodeIds?: readonly string[] | undefined;
  readonly onCollapsedNodeIdsChange?: ((nodeIds: readonly string[]) => void) | undefined;
  readonly toggleCollapseOnNodeDoubleClick?: boolean | undefined;
  readonly hiddenNodeIds?: readonly string[] | undefined;
  readonly onNodeExpand?: ((nodeId: string) => void | Promise<void>) | undefined;
  readonly onNodeCollapse?: ((nodeId: string) => void) | undefined;
  readonly searchQuery?: string | undefined;
  readonly hideUnmatchedSearch?: boolean | undefined;
  readonly searchPredicate?: ((node: TNodeRecord, query: string) => boolean) | undefined;
  readonly highlightedNodeIds?: readonly string[] | undefined;
  readonly highlightedEdgeIds?: readonly string[] | undefined;
  readonly highlightColor?: string | undefined;
  readonly highlightStrategy?:
    | ((context: {
        readonly nodes: readonly TNodeRecord[];
        readonly edges: readonly TEdgeRecord[];
        readonly query: string;
        readonly matchedNodeIds: readonly string[];
        readonly matchedEdgeIds: readonly string[];
      }) => Partial<GraphSearchResults>)
    | undefined;
  readonly onSearchResultsChange?: ((results: GraphSearchResults) => void) | undefined;
  readonly selectedNodeIds?: readonly string[] | undefined;
  readonly selectedEdgeIds?: readonly string[] | undefined;
  readonly defaultSelectedNodeIds?: readonly string[] | undefined;
  readonly defaultSelectedEdgeIds?: readonly string[] | undefined;
  readonly onSelectionChange?: ((selection: GraphSelection) => void) | undefined;
  readonly selectionMode?: SelectionMode | undefined;
  readonly nodeSelectionEnabled?: boolean | undefined;
  readonly edgeSelectionEnabled?: boolean | undefined;
  readonly selectionColor?: string | undefined;
  readonly edgeSelectionColor?: string | undefined;
  readonly layoutNodesOverride?: ((options: LayoutOptions) => readonly TNode[]) | undefined;
  readonly routeEdgesOverride?:
    | ((
        nodes: readonly TNode[],
        edges: readonly TEdgeRecord[],
        options?: RouteEdgesOptions
      ) => readonly TEdge[])
    | undefined;
  readonly renderBackground?:
    | ((context: GraphRenderContext<TGraph, TNode, TEdge>) => ReactNode)
    | undefined;
  readonly renderOverlay?:
    | ((context: GraphRenderContext<TGraph, TNode, TEdge>) => ReactNode)
    | undefined;
  readonly onError?: ((error: Error, context: GraphErrorContext<TGraph>) => void) | undefined;
  readonly onNodeHoverChange?:
    | ((node: TNode, hovered: boolean, meta: GraphHoverMeta) => void)
    | undefined;
  readonly onEdgeHoverChange?:
    | ((edge: TEdge, hovered: boolean, meta: GraphHoverMeta) => void)
    | undefined;
  readonly onNodeClick?: ((node: TNode) => void) | undefined;
  readonly onEdgeClick?: ((edge: TEdge) => void) | undefined;
}
