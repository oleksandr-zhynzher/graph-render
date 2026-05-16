import type { PositionedNode } from '@graph-render/types';

import { KeyboardDirection } from '../models/utils';

const getNodeCenter = (node: PositionedNode) => ({
  x: node.position.x + (node.size?.width ?? 0) / 2,
  y: node.position.y + (node.size?.height ?? 0) / 2,
});

export const getNearestNodeInDirection = (
  currentNode: PositionedNode,
  nodes: readonly PositionedNode[],
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
      (direction === KeyboardDirection.Left && center.x < currentCenter.x) ||
      (direction === KeyboardDirection.Right && center.x > currentCenter.x) ||
      (direction === KeyboardDirection.Up && center.y < currentCenter.y) ||
      (direction === KeyboardDirection.Down && center.y > currentCenter.y);

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

export { KeyboardDirection } from '../models/utils';
