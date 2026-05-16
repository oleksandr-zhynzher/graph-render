import type { NodeData, PositionedEdge, PositionedNode } from '@graph-render/types';
import { isFinitePoint } from './guards';

export const validatePositionedNodes = (
  nodes: PositionedNode[],
  expectedNodes: NodeData[] | PositionedNode[],
  source: 'layout' | 'layout override'
): void => {
  const expectedIds = new Set(expectedNodes.map((node) => node.id));

  if (nodes.length !== expectedNodes.length) {
    throw new Error(
      `${source} must return ${expectedNodes.length} nodes, received ${nodes.length}.`
    );
  }

  const seenIds = new Set<string>();
  nodes.forEach((node) => {
    if (!expectedIds.has(node.id)) {
      throw new Error(`${source} returned unknown node id "${node.id}".`);
    }
    if (seenIds.has(node.id)) {
      throw new Error(`${source} returned duplicate node id "${node.id}".`);
    }
    if (!isFinitePoint(node.position)) {
      throw new Error(`${source} returned a non-finite position for node "${node.id}".`);
    }
    seenIds.add(node.id);
  });
};

export const validatePositionedEdges = (
  edges: PositionedEdge[],
  nodeIds: Set<string>,
  source: 'routing' | 'routing override'
): void => {
  const seenIds = new Set<string>();

  edges.forEach((edge) => {
    if (seenIds.has(edge.id)) {
      throw new Error(`${source} returned duplicate edge id "${edge.id}".`);
    }
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      throw new Error(
        `${source} returned edge "${edge.id}" with unknown endpoint(s): ${edge.source} -> ${edge.target}.`
      );
    }
    if (!Array.isArray(edge.points) || edge.points.length < 2) {
      throw new Error(`${source} returned edge "${edge.id}" without a valid point path.`);
    }
    edge.points.forEach((point, index) => {
      if (!isFinitePoint(point)) {
        throw new Error(
          `${source} returned a non-finite point at index ${index} for edge "${edge.id}".`
        );
      }
    });
    seenIds.add(edge.id);
  });
};
