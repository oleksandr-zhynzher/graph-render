import { PositionedNode } from '@graph-render/types';

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_COLUMN_TOLERANCE = 24;

export interface NodeColumn<TNode extends PositionedNode = PositionedNode> {
  centerX: number;
  nodes: TNode[];
}

const getNodeWidth = (node: PositionedNode): number => node.size?.width ?? DEFAULT_NODE_WIDTH;

const getNodeCenterX = (node: PositionedNode): number => node.position.x + getNodeWidth(node) / 2;

export const groupPositionedNodesByColumn = <TNode extends PositionedNode = PositionedNode>(
  nodes: TNode[],
  tolerance: number = DEFAULT_COLUMN_TOLERANCE
): NodeColumn<TNode>[] => {
  const sortedNodes = [...nodes].sort((left, right) => getNodeCenterX(left) - getNodeCenterX(right));
  const columns: Array<{ centerX: number; avgWidth: number; nodes: TNode[] }> = [];

  sortedNodes.forEach((node) => {
    const nodeCenterX = getNodeCenterX(node);
    const nodeWidth = getNodeWidth(node);
    const current = columns[columns.length - 1];

    if (!current) {
      columns.push({ centerX: nodeCenterX, avgWidth: nodeWidth, nodes: [node] });
      return;
    }

    const threshold = Math.max(tolerance, Math.min(current.avgWidth, nodeWidth) * 0.35);
    if (Math.abs(nodeCenterX - current.centerX) > threshold) {
      columns.push({ centerX: nodeCenterX, avgWidth: nodeWidth, nodes: [node] });
      return;
    }

    current.nodes.push(node);
    current.centerX =
      current.nodes.reduce((sum, entry) => sum + getNodeCenterX(entry), 0) / current.nodes.length;
    current.avgWidth =
      current.nodes.reduce((sum, entry) => sum + getNodeWidth(entry), 0) / current.nodes.length;
  });

  return columns.map((column) => ({
    centerX: column.centerX,
    nodes: [...column.nodes].sort((left, right) => left.position.y - right.position.y),
  }));
};