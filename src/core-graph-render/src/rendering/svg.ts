import { NxGraphInput } from '@graph-render/types';
import type { RenderGraphToSvgOptions, RenderGraphToSvgResult } from '@graph-render/types';
import { fromNxGraph } from '../utils';
import { normalizeEdges } from '../model';
import { defaultNodeRenderer, defaultEdgeRenderer } from './defaultRenderers';
import { assembleSvgDocument, createArrowMarkerDef, createMetadataElements } from './svg/elements';
import { extractRenderConfig, extractRenderTheme } from './svg/config';
import { getPositionedEdgesWithFallback, getPositionedNodesWithFallback } from './svg/layout';
import { renderEdgesToSvg, renderNodesToSvg } from './svg/content';

export const renderGraphToSvg = (
  graph: NxGraphInput,
  options?: RenderGraphToSvgOptions
): RenderGraphToSvgResult => {
  const config = extractRenderConfig(options);
  const { nodes: sourceNodes, edges: sourceEdges } = fromNxGraph(graph, config.defaultEdgeType, {
    inputValidationMode: config.inputValidationMode,
  });
  const normalizedEdges = normalizeEdges(sourceEdges, config.defaultEdgeType);
  const positionedNodes = getPositionedNodesWithFallback(sourceNodes, normalizedEdges, config);
  const positionedEdges = getPositionedEdgesWithFallback(positionedNodes, normalizedEdges, config);
  const theme = extractRenderTheme(config);

  const defs = config.showArrows ? createArrowMarkerDef(config.markerId, theme.edgeColor) : '';
  const svg = assembleSvgDocument({
    width: config.width,
    height: config.height,
    background: theme.background,
    fontFamily: config.safeFontFamily,
    metadata: createMetadataElements(options?.title, options?.desc),
    defs,
    edgesMarkup: renderEdgesToSvg(
      positionedEdges,
      config.curveEdges,
      config.curveStrength,
      options?.edgeRenderer ?? defaultEdgeRenderer,
      theme,
      config.showArrows ? config.markerId : ''
    ),
    nodesMarkup: renderNodesToSvg(positionedNodes, options?.vertexRenderer ?? defaultNodeRenderer),
  });

  return {
    svg,
    width: config.width,
    height: config.height,
    nodes: positionedNodes,
    edges: positionedEdges,
  };
};
