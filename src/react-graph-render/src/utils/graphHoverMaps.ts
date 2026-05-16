import { groupEdgesByTarget, sortEdgesBySourcePosition } from '@graph-render/core';
import type { PositionedEdge } from '@graph-render/types';
import type { PositionedHoverNode } from '../models/utils';

export type { PositionedHoverNode };

export const buildEdgeById = (edges: PositionedEdge[]) =>
  new Map(edges.map((edge) => [edge.id, edge]));

export const buildEdgesByNodeId = (edges: PositionedEdge[]) => {
  const map = new Map<string, PositionedEdge[]>();

  edges.forEach((edge) => {
    map.set(edge.source, [...(map.get(edge.source) ?? []), edge]);
    if (edge.target !== edge.source) {
      map.set(edge.target, [...(map.get(edge.target) ?? []), edge]);
    }
  });

  return map;
};

export const buildNodePositionMap = (nodes: PositionedHoverNode[]) => {
  const map = new Map<string, { x: number; y: number }>();
  nodes.forEach((node) => map.set(node.id, node.position));
  return map;
};

export const buildIncomingEdgesByTarget = (
  edges: PositionedEdge[],
  nodePositions: Map<string, { x: number; y: number }>
) => {
  const map = groupEdgesByTarget(edges);
  map.forEach((targetEdges, targetId) => {
    map.set(targetId, sortEdgesBySourcePosition(targetEdges, nodePositions));
  });
  return map;
};
