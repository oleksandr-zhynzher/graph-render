import { PositionedEdge } from '@graph-render/types';

/**
 * Group edges by their target node
 */
export const groupEdgesByTarget = (edges: PositionedEdge[]): Map<string, PositionedEdge[]> => {
  const map = new Map<string, PositionedEdge[]>();
  edges.forEach((edge) => {
    const arr = map.get(edge.target) ?? [];
    arr.push(edge);
    map.set(edge.target, arr);
  });
  return map;
};

/**
 * Sort edges by their source node position (y first, then x)
 */
export const sortEdgesBySourcePosition = (
  edges: PositionedEdge[],
  nodePositions: Map<string, { x: number; y: number }>
): PositionedEdge[] => {
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
