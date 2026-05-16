import type { PositionedEdge } from '@graph-render/types';

/**
 * Group edges by their target node
 */
export const groupEdgesByTarget = (
  edges: readonly PositionedEdge[]
): ReadonlyMap<string, readonly PositionedEdge[]> => {
  const map = new Map<string, PositionedEdge[]>();
  for (const edge of edges) {
    const arr = map.get(edge.target) ?? [];
    arr.push(edge);
    map.set(edge.target, arr);
  }
  return map;
};

/**
 * Sort edges by their source node position (y first, then x)
 */
export const sortEdgesBySourcePosition = (
  edges: readonly PositionedEdge[],
  nodePositions: ReadonlyMap<string, { readonly x: number; readonly y: number }>
): readonly PositionedEdge[] => {
  return [...edges].sort((a, b) => {
    const pa = nodePositions.get(a.source);
    const pb = nodePositions.get(b.source);
    if (pa && pb) {
      if (pa.y !== pb.y) return pa.y - pb.y;
      return pa.x - pb.x;
    }
    return 0;
  });
};
