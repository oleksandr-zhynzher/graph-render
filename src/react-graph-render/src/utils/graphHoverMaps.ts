import { groupEdgesByTarget, sortEdgesBySourcePosition } from '@graph-render/core';
import type { PositionedEdge } from '@graph-render/types';

import type { PositionedHoverNode } from '../models/utils';

export const buildEdgeById = (edges: readonly PositionedEdge[]) =>
  new Map(edges.map((edge) => [edge.id, edge]));

export const buildEdgesByNodeId = (edges: readonly PositionedEdge[]) => {
  const map = new Map<string, PositionedEdge[]>();

  for (const edge of edges) {
    map.set(edge.source, [...(map.get(edge.source) ?? []), edge]);
    if (edge.target !== edge.source) {
      map.set(edge.target, [...(map.get(edge.target) ?? []), edge]);
    }
  }

  return map;
};

export const buildNodePositionMap = (nodes: readonly PositionedHoverNode[]) => {
  const map = new Map<string, { x: number; y: number }>();
  for (const node of nodes) map.set(node.id, node.position);
  return map;
};

export const buildIncomingEdgesByTarget = (
  edges: readonly PositionedEdge[],
  nodePositions: ReadonlyMap<string, { readonly x: number; readonly y: number }>
) => {
  const map = new Map(groupEdgesByTarget(edges));
  for (const [targetId, targetEdges] of map.entries()) {
    map.set(targetId, sortEdgesBySourcePosition(targetEdges, nodePositions));
  }
  return map;
};

export { type PositionedHoverNode } from '../models/utils';
