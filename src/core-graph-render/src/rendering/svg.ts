import {
  NxGraphInput,
  PositionedNode,
  PositionedEdge,
  EdgeData,
  EdgeType,
  LayoutType,
  LayoutDirection,
} from '@graph-render/types';
import type { NodeRenderer, EdgeRenderer } from '@graph-render/types';
import type {
  RenderGraphToSvgOptions,
  RenderGraphToSvgResult,
  RenderConfig,
  RenderTheme,
} from '@graph-render/types';
import { DEFAULT_THEME, fromNxGraph } from '../utils';
import { layoutNodes } from '../layouts';
import { routeEdges, buildEdgePath } from '../edges';
import { defaultNodeRenderer, defaultEdgeRenderer } from './defaultRenderers';
import { escapeXml } from './utils';

/**
 * Extract and normalize configuration from options
 */
const extractRenderConfig = (options?: RenderGraphToSvgOptions): RenderConfig => {
  const cfg = options?.config ?? {};
  const mergedTheme = { ...DEFAULT_THEME, ...(cfg.theme ?? {}) };
  const safeFontFamily = escapeXml(mergedTheme.fontFamily ?? DEFAULT_THEME.fontFamily);
  const width = Number.isFinite(cfg.width) && (cfg.width ?? 0) > 0 ? cfg.width! : 960;
  const height = Number.isFinite(cfg.height) && (cfg.height ?? 0) > 0 ? cfg.height! : 720;
  const padding =
    Number.isFinite(cfg.padding) && (cfg.padding ?? -1) >= 0 ? cfg.padding : undefined;
  const curveStrength =
    Number.isFinite(cfg.curveStrength) && cfg.curveStrength != null
      ? Math.min(Math.max(cfg.curveStrength, 0), 1)
      : 0.3;
  const arrowPadding =
    Number.isFinite(cfg.arrowPadding) && (cfg.arrowPadding ?? -1) >= 0 ? cfg.arrowPadding! : 6;

  return {
    width,
    height,
    padding,
    defaultEdgeType: cfg.defaultEdgeType ?? EdgeType.Directed,
    curveEdges: cfg.curveEdges ?? true,
    curveStrength,
    arrowPadding,
    layout: cfg.layout ?? LayoutType.Centered,
    layoutDirection: cfg.layoutDirection ?? LayoutDirection.LTR,
    markerId: options?.markerId ?? 'arrow',
    mergedTheme,
    safeFontFamily,
  };
};

/**
 * Normalize edges with default type
 */
const normalizeEdges = (edges: EdgeData[], defaultType: EdgeType): EdgeData[] => {
  return edges.map((edge) => ({ ...edge, type: edge.type ?? defaultType }));
};

/**
 * Extract theme properties for rendering
 */
const extractRenderTheme = (config: RenderConfig): RenderTheme => {
  return {
    edgeColor: config.mergedTheme.edgeColor ?? DEFAULT_THEME.edgeColor,
    edgeWidth: config.mergedTheme.edgeWidth ?? DEFAULT_THEME.edgeWidth,
    background: config.mergedTheme.background,
  };
};

/**
 * Create SVG marker definition for arrow heads
 */
const createArrowMarkerDef = (markerId: string, edgeColor: string): string => {
  return [
    `<marker id="${markerId}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">`,
    `<path d="M 0 0 L 10 5 L 0 10 z" fill="${edgeColor}" />`,
    '</marker>',
  ].join('');
};

/**
 * Render all edges to SVG markup
 */
const renderEdgesToSvg = (
  edges: PositionedEdge[],
  curveEdges: boolean,
  curveStrength: number,
  edgeRenderer: EdgeRenderer,
  theme: RenderTheme,
  markerId: string
): string => {
  return edges
    .map((edge) => {
      const pathD = buildEdgePath(edge, curveEdges, curveStrength);
      if (!pathD) return '';
      return edgeRenderer(edge, pathD, {
        edgeColor: theme.edgeColor,
        edgeWidth: theme.edgeWidth,
        markerId,
      });
    })
    .join('');
};

/**
 * Render all nodes to SVG markup
 */
const renderNodesToSvg = (nodes: PositionedNode[], nodeRenderer: NodeRenderer): string => {
  return nodes
    .map((node) => {
      const body = nodeRenderer(node);
      return `<g transform="translate(${node.position.x}, ${node.position.y})">${body}</g>`;
    })
    .join('');
};

/**
 * Create SVG metadata elements (title and description)
 */
const createMetadataElements = (title?: string, desc?: string): string => {
  const titleElement = title ? `<title>${escapeXml(title)}</title>` : '';
  const descElement = desc ? `<desc>${escapeXml(desc)}</desc>` : '';
  return titleElement + descElement;
};

/**
 * Assemble complete SVG document
 */
const assembleSvgDocument = (
  width: number,
  height: number,
  background: string,
  fontFamily: string,
  metadata: string,
  defs: string,
  edgesMarkup: string,
  nodesMarkup: string
): string => {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:${background};font-family:${fontFamily};">`,
    metadata,
    '<defs>',
    defs,
    '</defs>',
    '<g>',
    edgesMarkup,
    nodesMarkup,
    '</g>',
    '</svg>',
  ].join('');
};

/**
 * Render a graph to SVG format
 */
export const renderGraphToSvg = (
  graph: NxGraphInput,
  options?: RenderGraphToSvgOptions
): RenderGraphToSvgResult => {
  const config = extractRenderConfig(options);

  // Parse and normalize graph data
  const { nodes: sourceNodes, edges: sourceEdges } = fromNxGraph(graph, config.defaultEdgeType);
  const normalizedEdges = normalizeEdges(sourceEdges, config.defaultEdgeType);

  // Layout nodes and route edges
  const positionedNodes = layoutNodes({
    nodes: sourceNodes,
    edges: normalizedEdges,
    theme: config.mergedTheme,
    padding: config.padding,
    layout: config.layout,
    width: config.width,
    height: config.height,
    layoutDirection: config.layoutDirection,
    nodeSizing: options?.config?.nodeSizing,
    fixedNodeSize: options?.config?.fixedNodeSize,
    labelMeasurementPaddingX: options?.config?.labelMeasurementPaddingX,
    labelMeasurementPaddingY: options?.config?.labelMeasurementPaddingY,
    labelMeasurementCharWidth: options?.config?.labelMeasurementCharWidth,
    labelMeasurementLineHeight: options?.config?.labelMeasurementLineHeight,
  });

  const positionedEdges = routeEdges(positionedNodes, normalizedEdges, {
    arrowPadding: config.arrowPadding,
    straight: !config.curveEdges,
    layoutDirection: config.layoutDirection,
    forceRightToLeft: options?.config?.forceRightToLeft ?? false,
  });

  // Extract rendering components
  const theme = extractRenderTheme(config);
  const nodeRenderer = options?.vertexRenderer ?? defaultNodeRenderer;
  const edgeRenderer = options?.edgeRenderer ?? defaultEdgeRenderer;

  // Generate SVG elements
  const defs = createArrowMarkerDef(config.markerId, theme.edgeColor);
  const edgesMarkup = renderEdgesToSvg(
    positionedEdges,
    config.curveEdges,
    config.curveStrength,
    edgeRenderer,
    theme,
    config.markerId
  );
  const nodesMarkup = renderNodesToSvg(positionedNodes, nodeRenderer);
  const metadata = createMetadataElements(options?.title, options?.desc);

  // Assemble final SVG
  const svg = assembleSvgDocument(
    config.width,
    config.height,
    theme.background,
    config.safeFontFamily,
    metadata,
    defs,
    edgesMarkup,
    nodesMarkup
  );

  return {
    svg,
    width: config.width,
    height: config.height,
    nodes: positionedNodes,
    edges: positionedEdges,
  };
};
