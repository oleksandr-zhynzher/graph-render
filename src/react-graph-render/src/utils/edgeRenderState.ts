import type { PositionedEdge } from '@graph-render/types';
import { EdgeType } from '@graph-render/types';

export interface EdgeRenderStateParams {
  readonly hoverHighlight: boolean;
  readonly hoveredEdgeId: string | null;
  readonly hoveredNodeId: string | null;
  readonly pathHighlightEdges?: ReadonlySet<string> | undefined;
}

export interface EdgeRenderState {
  readonly edgeHovered: boolean;
  readonly isIncomingToHovered: boolean;
}

export function getEdgeRenderState(
  edge: PositionedEdge,
  { hoverHighlight, hoveredEdgeId, hoveredNodeId, pathHighlightEdges }: EdgeRenderStateParams
): EdgeRenderState {
  const hoveredNodeMatches =
    hoveredNodeId === null ? false : edge.source === hoveredNodeId || edge.target === hoveredNodeId;
  const edgeHovered = Boolean(
    (hoverHighlight && (hoveredEdgeId === edge.id || hoveredNodeMatches)) ||
    pathHighlightEdges?.has(edge.id)
  );

  const isIncomingToHovered = Boolean(
    hoveredNodeId &&
    !hoveredEdgeId &&
    edge.type !== EdgeType.Undirected &&
    edge.target === hoveredNodeId
  );

  return { edgeHovered, isIncomingToHovered };
}
