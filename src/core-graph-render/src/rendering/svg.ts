import type {
  NxGraphInput,
  RenderGraphToSvgOptions,
  RenderGraphToSvgResult,
} from '@graph-render/types';

import { normalizeEdges } from '../model';
import { fromNxGraph } from '../utils';
import { defaultEdgeRenderer, defaultNodeRenderer } from './defaultRenderers';
import { extractRenderConfig, extractRenderTheme } from './svg/config';
import { renderEdgesToSvg, renderNodesToSvg } from './svg/content';
import { assembleSvgDocument, createArrowMarkerDef, createMetadataElements } from './svg/elements';
import { getPositionedEdgesWithFallback, getPositionedNodesWithFallback } from './svg/layout';

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
