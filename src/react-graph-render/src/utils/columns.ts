import type { PositionedNode } from '@graph-render/types';

import { DEFAULT_COLUMN_TOLERANCE, DEFAULT_NODE_WIDTH } from '../constants/graph';
import type { NodeColumn } from '../models/domain';

const getNodeWidth = (node: PositionedNode): number => node.size?.width ?? DEFAULT_NODE_WIDTH;

const getNodeCenterX = (node: PositionedNode): number => node.position.x + getNodeWidth(node) / 2;

export const groupPositionedNodesByColumn = <TNode extends PositionedNode = PositionedNode>(
  nodes: readonly TNode[],
  tolerance: number = DEFAULT_COLUMN_TOLERANCE
): ReadonlyArray<NodeColumn<TNode>> => {
  const sortedNodes = [...nodes].sort(
    (left, right) => getNodeCenterX(left) - getNodeCenterX(right)
  );
  const columns: Array<{ centerX: number; avgWidth: number; nodes: TNode[] }> = [];

  for (const node of sortedNodes) {
    const nodeCenterX = getNodeCenterX(node);
    const nodeWidth = getNodeWidth(node);
    const current = columns.at(-1);

    if (!current) {
      columns.push({ centerX: nodeCenterX, avgWidth: nodeWidth, nodes: [node] });
      continue;
    }

    const threshold = Math.max(tolerance, Math.min(current.avgWidth, nodeWidth) * 0.35);
    if (Math.abs(nodeCenterX - current.centerX) > threshold) {
      columns.push({ centerX: nodeCenterX, avgWidth: nodeWidth, nodes: [node] });
      continue;
    }

    current.nodes.push(node);
    // Maintain a running average so column grouping remains linear.
    const newCount = current.nodes.length;
    current.centerX = (current.centerX * (newCount - 1) + nodeCenterX) / newCount;
    current.avgWidth = (current.avgWidth * (newCount - 1) + nodeWidth) / newCount;
  }

  return columns.map((column) => ({
    centerX: column.centerX,
    nodes: [...column.nodes].sort((left, right) => left.position.y - right.position.y),
  }));
};

export { DEFAULT_NODE_WIDTH } from '../constants/graph';
export { type NodeColumn } from '../models/domain';
