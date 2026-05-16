import type { PositionedEdge } from '@graph-render/types';

export interface EdgeRenderStateParams {
  hoverHighlight: boolean;
  hoveredEdgeId: string | null;
  hoveredNodeId: string | null;
  pathHighlightEdges?: Set<string>;
}

export interface EdgeRenderState {
  edgeHovered: boolean;
  isIncomingToHovered: boolean;
}

export function getEdgeRenderState(
  edge: PositionedEdge,
  { hoverHighlight, hoveredEdgeId, hoveredNodeId, pathHighlightEdges }: EdgeRenderStateParams
): EdgeRenderState {
  const edgeHovered = Boolean(
    (hoverHighlight &&
      (hoveredEdgeId === edge.id ||
        (hoveredNodeId && (edge.source === hoveredNodeId || edge.target === hoveredNodeId)))) ||
    pathHighlightEdges?.has(edge.id)
  );

  const isIncomingToHovered = Boolean(
    hoveredNodeId && !hoveredEdgeId && edge.type !== 'undirected' && edge.target === hoveredNodeId
  );

  return { edgeHovered, isIncomingToHovered };
}
