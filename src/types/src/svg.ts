import type {
  GraphConfig,
  EdgeType,
  LayoutType,
  LayoutDirection,
  GraphTheme,
  NodeRenderer,
  EdgeRenderer,
  PositionedNode,
  PositionedEdge,
} from './index';

/**
 * Options for rendering a graph to SVG
 */
export interface RenderGraphToSvgOptions {
  config?: GraphConfig;
  vertexRenderer?: NodeRenderer;
  edgeRenderer?: EdgeRenderer;
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
  layout: LayoutType;
  layoutDirection: LayoutDirection;
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
