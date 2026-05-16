import type { PositionedNode } from '@graph-render/types';
import type { KeyboardDirection } from '../models/utils';

export type { KeyboardDirection };

const getNodeCenter = (node: PositionedNode) => ({
  x: node.position.x + (node.size?.width ?? 0) / 2,
  y: node.position.y + (node.size?.height ?? 0) / 2,
});

export const getNearestNodeInDirection = (
  currentNode: PositionedNode,
  nodes: PositionedNode[],
  direction: KeyboardDirection
): PositionedNode | null => {
  const currentCenter = getNodeCenter(currentNode);
  let nearest: PositionedNode | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const node of nodes) {
    if (node.id === currentNode.id) {
      continue;
    }

    const center = getNodeCenter(node);
    const isCandidate =
      (direction === 'left' && center.x < currentCenter.x) ||
      (direction === 'right' && center.x > currentCenter.x) ||
      (direction === 'up' && center.y < currentCenter.y) ||
      (direction === 'down' && center.y > currentCenter.y);

    if (!isCandidate) {
      continue;
    }

    const distance = Math.hypot(center.x - currentCenter.x, center.y - currentCenter.y);
    if (distance < nearestDistance) {
      nearest = node;
      nearestDistance = distance;
    }
  }

  return nearest;
};
