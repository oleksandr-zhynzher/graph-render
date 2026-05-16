import type { EdgeId, PathTraversalResult, PositionedEdge } from '@graph-render/types';
import type { HoveredNodeState, HoveredNodeStateParams } from '../models/utils';

export type { HoveredNodeState };

const addNodeState = (
  map: Map<string, HoveredNodeState>,
  id: string,
  dir: keyof HoveredNodeState
) => {
  const curr = map.get(id) ?? { in: false, out: false };
  map.set(id, { ...curr, [dir]: true });
};

const addEdgeNodeStates = (map: Map<string, HoveredNodeState>, edge: PositionedEdge) => {
  if (edge.type === 'undirected') {
    addNodeState(map, edge.source, 'in');
    addNodeState(map, edge.source, 'out');
    addNodeState(map, edge.target, 'in');
    addNodeState(map, edge.target, 'out');
    return;
  }

  addNodeState(map, edge.source, 'out');
  addNodeState(map, edge.target, 'in');
};

const applyPathNodeStates = (
  map: Map<string, HoveredNodeState>,
  pathHighlight: PathTraversalResult | null
) => {
  pathHighlight?.nodes.forEach((id) => {
    const curr = map.get(id) ?? { in: false, out: false };
    map.set(id, { ...curr, in: true, out: true });
  });
};

export const buildHoveredNodeStates = ({
  hoverHighlight,
  focusedPath,
  hoveredEdgeId,
  hoveredNodeId,
  edgeById,
  edgesByNodeId,
  pathHighlight,
}: HoveredNodeStateParams) => {
  if (!hoverHighlight && !pathHighlight) return null;

  const map = new Map<string, HoveredNodeState>();
  if (focusedPath) {
    applyPathNodeStates(map, pathHighlight);
    return map.size ? map : null;
  }

  if (hoverHighlight && hoveredEdgeId) {
    const match = edgeById.get(hoveredEdgeId);
    if (match) addEdgeNodeStates(map, match);
  } else if (hoverHighlight && hoveredNodeId) {
    (edgesByNodeId.get(hoveredNodeId) ?? []).forEach((edge) => {
      addEdgeNodeStates(map, edge);
    });
    addNodeState(map, hoveredNodeId, 'in');
    addNodeState(map, hoveredNodeId, 'out');
  }

  applyPathNodeStates(map, pathHighlight);
  return map.size ? map : null;
};

export const getHighlightedEdgeIds = (
  hoverHighlight: boolean,
  focusedPath: unknown,
  hoveredEdgeId: EdgeId | null,
  hoveredNodeId: string | null,
  edgesByNodeId: Map<string, PositionedEdge[]>,
  pathHighlight: PathTraversalResult | null
) => {
  const ids = new Set<EdgeId>();

  if (focusedPath && pathHighlight) {
    pathHighlight.edges.forEach((id) => ids.add(id));
    return ids;
  }

  if (hoverHighlight && hoveredEdgeId) {
    ids.add(hoveredEdgeId);
  } else if (hoverHighlight && hoveredNodeId) {
    (edgesByNodeId.get(hoveredNodeId) ?? []).forEach((edge) => ids.add(edge.id));
  }
  pathHighlight?.edges.forEach((id) => ids.add(id));

  return ids;
};
