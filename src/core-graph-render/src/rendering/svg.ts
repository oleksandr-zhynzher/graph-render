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
import { DEFAULT_THEME, fromNxGraph, normalizeGraphConfig } from '../utils';
import { layoutNodes } from '../layouts';
import { routeEdges, buildEdgePath } from '../edges';
import { defaultNodeRenderer, defaultEdgeRenderer } from './defaultRenderers';
import { escapeXml, sanitizeCssColor, sanitizeFontFamily, sanitizeSvgId } from './utils';

/**
 * Extract and normalize configuration from options
 */
const extractRenderConfig = (options?: RenderGraphToSvgOptions): RenderConfig => {
  const cfg = normalizeGraphConfig(options?.config);
  const mergedTheme = { ...DEFAULT_THEME, ...(cfg.theme ?? {}) };
  const safeFontFamily = escapeXml(
    sanitizeFontFamily(mergedTheme.fontFamily, DEFAULT_THEME.fontFamily)
  );

  return {
    width: cfg.width,
    height: cfg.height,
    padding: cfg.padding,
    defaultEdgeType: cfg.defaultEdgeType,
    curveEdges: cfg.curveEdges,
    curveStrength: cfg.curveStrength,
    arrowPadding: cfg.arrowPadding,
    showArrows: cfg.showArrows,
    nodeSizing: cfg.nodeSizing,
    fixedNodeSize: cfg.fixedNodeSize,
    labelMeasurementPaddingX: cfg.labelMeasurementPaddingX,
    labelMeasurementPaddingY: cfg.labelMeasurementPaddingY,
    labelMeasurementCharWidth: cfg.labelMeasurementCharWidth,
    labelMeasurementLineHeight: cfg.labelMeasurementLineHeight,
    routingStyle: cfg.routingStyle,
    edgeSeparation: cfg.edgeSeparation,
    selfLoopRadius: cfg.selfLoopRadius,
    layout: cfg.layout,
    layoutDirection: cfg.layoutDirection,
    forceRightToLeft: cfg.forceRightToLeft,
    markerId: sanitizeSvgId(options?.markerId ?? 'arrow', 'arrow'),
    edgeLabelColor: cfg.edgeLabelColor,
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
    edgeColor: sanitizeCssColor(config.mergedTheme.edgeColor, DEFAULT_THEME.edgeColor),
    edgeWidth: config.mergedTheme.edgeWidth ?? DEFAULT_THEME.edgeWidth,
    edgeLabelColor: sanitizeCssColor(config.edgeLabelColor, '#334155'),
    background: sanitizeCssColor(config.mergedTheme.background, DEFAULT_THEME.background),
  };
};

/**
 * Create SVG marker definition for arrow heads
 */
const createArrowMarkerDef = (markerId: string, edgeColor: string): string => {
  return [
    `<marker id="${escapeXml(markerId)}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">`,
    `<path d="M 0 0 L 10 5 L 0 10 z" fill="${escapeXml(edgeColor)}" />`,
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
        edgeLabelColor: theme.edgeLabelColor,
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
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:${escapeXml(background)};font-family:${fontFamily};">`,
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
    nodeSizing: config.nodeSizing,
    fixedNodeSize: config.fixedNodeSize,
    labelMeasurementPaddingX: config.labelMeasurementPaddingX,
    labelMeasurementPaddingY: config.labelMeasurementPaddingY,
    labelMeasurementCharWidth: config.labelMeasurementCharWidth,
    labelMeasurementLineHeight: config.labelMeasurementLineHeight,
  });

  const positionedEdges = routeEdges(positionedNodes, normalizedEdges, {
    arrowPadding: config.arrowPadding,
    straight: !config.curveEdges || config.routingStyle === 'orthogonal',
    layoutDirection: config.layoutDirection,
    forceRightToLeft: config.forceRightToLeft ?? false,
    routingStyle: config.routingStyle,
    edgeSeparation: config.edgeSeparation,
    selfLoopRadius: config.selfLoopRadius,
  });

  // Extract rendering components
  const theme = extractRenderTheme(config);
  const nodeRenderer = options?.vertexRenderer ?? defaultNodeRenderer;
  const edgeRenderer = options?.edgeRenderer ?? defaultEdgeRenderer;

  // Generate SVG elements
  const defs = config.showArrows ? createArrowMarkerDef(config.markerId, theme.edgeColor) : '';
  const edgesMarkup = renderEdgesToSvg(
    positionedEdges,
    config.curveEdges,
    config.curveStrength,
    edgeRenderer,
    theme,
    config.showArrows ? config.markerId : ''
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
