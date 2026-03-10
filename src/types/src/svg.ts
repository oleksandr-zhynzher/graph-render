import type {
  GraphConfig,
  EdgeType,
  LayoutType,
  LayoutDirection,
  GraphTheme,
  NodeSizingMode,
  Size,
  NodeRenderer,
  EdgeRenderer,
  PositionedNode,
  PositionedEdge,
} from './index';

/**
 * Options for rendering a graph to SVG
 */
export interface RenderGraphToSvgOptions<
  TNode extends PositionedNode = PositionedNode,
  TEdge extends PositionedEdge = PositionedEdge,
> {
  config?: GraphConfig;
  vertexRenderer?: NodeRenderer<TNode>;
  edgeRenderer?: EdgeRenderer<TEdge>;
  markerId?: string;
  title?: string;
  desc?: string;
}

/**
 * Result of rendering a graph to SVG
 */
export interface RenderGraphToSvgResult {
  svg: string;
  width: number;
  height: number;
  nodes: PositionedNode[];
  edges: PositionedEdge[];
}

/**
 * Internal render configuration with all required properties
 */
export interface RenderConfig {
  width: number;
  height: number;
  padding: number | undefined;
  defaultEdgeType: EdgeType;
  curveEdges: boolean;
  curveStrength: number;
  arrowPadding: number;
  showArrows: boolean;
  nodeSizing: NodeSizingMode;
  fixedNodeSize: Size;
  labelMeasurementPaddingX: number;
  labelMeasurementPaddingY: number;
  labelMeasurementCharWidth: number;
  labelMeasurementLineHeight: number;
  routingStyle: NonNullable<GraphConfig['routingStyle']>;
  edgeSeparation: number;
  selfLoopRadius: number;
  layout: LayoutType;
  layoutDirection: LayoutDirection;
  forceRightToLeft?: boolean;
  markerId: string;
  edgeLabelColor: string;
  mergedTheme: Required<
    Pick<GraphTheme, 'background' | 'edgeColor' | 'edgeWidth' | 'fontFamily'>
  > & { nodeGap: number };
  safeFontFamily: string;
}

/**
 * Theme properties used during rendering
 */
export interface RenderTheme {
  edgeColor: string;
  edgeWidth: number;
  edgeLabelColor: string;
  background: string;
}
