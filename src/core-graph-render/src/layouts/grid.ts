import { NodeData, PositionedNode, Point } from '@graph-render/types';
import { DEFAULT_NODE_SIZE, DEFAULT_PADDING, DEFAULT_NODE_GAP } from '../utils/constants';

/**
 * Calculate grid dimensions based on node count
 */
function calculateGridColumns(nodeCount: number): number {
  return Math.ceil(Math.sqrt(nodeCount));
}

/**
 * Calculate grid position for a node at a given index
 */
function calculateGridPosition(
  index: number,
  columns: number,
  nodeWidth: number,
  nodeHeight: number,
  padding: number,
  gap: number
): Point {
  const col = index % columns;
  const row = Math.floor(index / columns);
  return {
    x: padding + col * (nodeWidth + gap),
    y: padding + row * (nodeHeight + gap),
  };
}

/**
 * Layout nodes in a grid pattern
 */
export function gridLayout(
  nodes: NodeData[],
  pad: number = DEFAULT_PADDING,
  gap: number = DEFAULT_NODE_GAP
): PositionedNode[] {
  const count = nodes.length;
  const cols = calculateGridColumns(count);

  return nodes.map((node, idx) => {
    if (node.position) return node as PositionedNode;

    const nodeWidth = node.size?.width ?? DEFAULT_NODE_SIZE.width;
    const nodeHeight = node.size?.height ?? DEFAULT_NODE_SIZE.height;
    const position = calculateGridPosition(idx, cols, nodeWidth, nodeHeight, pad, gap);

    return { ...node, position } as PositionedNode;
  });
}
