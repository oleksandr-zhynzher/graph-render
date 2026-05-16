import type { EdgeId, PathTraversalResult, PositionedEdge } from '@graph-render/types';
import { EdgeType } from '@graph-render/types';

import type { HoveredNodeState, HoveredNodeStateParams } from '../models/utils';

const addNodeState = (
  map: Map<string, HoveredNodeState>,
  id: string,
  dir: keyof HoveredNodeState
) => {
  const curr = map.get(id) ?? { in: false, out: false };
  map.set(id, { ...curr, [dir]: true });
};

const addEdgeNodeStates = (map: Map<string, HoveredNodeState>, edge: PositionedEdge) => {
  if (edge.type === EdgeType.Undirected) {
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
  for (const id of pathHighlight?.nodes ?? []) {
    const curr = map.get(id) ?? { in: false, out: false };
    map.set(id, { ...curr, in: true, out: true });
  }
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
    return map.size > 0 ? map : null;
  }

  if (hoverHighlight && hoveredEdgeId) {
    const match = edgeById.get(hoveredEdgeId);
    if (match) addEdgeNodeStates(map, match);
  } else if (hoverHighlight && hoveredNodeId) {
    for (const edge of edgesByNodeId.get(hoveredNodeId) ?? []) {
      addEdgeNodeStates(map, edge);
    }
    addNodeState(map, hoveredNodeId, 'in');
    addNodeState(map, hoveredNodeId, 'out');
  }

  applyPathNodeStates(map, pathHighlight);
  return map.size > 0 ? map : null;
};

export const getHighlightedEdgeIds = (
  hoverHighlight: boolean,
  focusedPath: unknown,
  hoveredEdgeId: EdgeId | null,
  hoveredNodeId: string | null,
  edgesByNodeId: ReadonlyMap<string, readonly PositionedEdge[]>,
  pathHighlight: PathTraversalResult | null
) => {
  const ids = new Set<EdgeId>();

  if (focusedPath && pathHighlight) {
    for (const id of pathHighlight.edges) ids.add(id);
    return ids;
  }

  if (hoverHighlight && hoveredEdgeId) {
    ids.add(hoveredEdgeId);
  } else if (hoverHighlight && hoveredNodeId) {
    for (const edge of edgesByNodeId.get(hoveredNodeId) ?? []) ids.add(edge.id);
  }
  for (const id of pathHighlight?.edges ?? []) ids.add(id);

  return ids;
};

export { type HoveredNodeState } from '../models/utils';
