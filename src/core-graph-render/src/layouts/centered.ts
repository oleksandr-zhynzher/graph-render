import { NodeData, PositionedNode, Point } from '@graph-render/types';
import { DEFAULT_NODE_SIZE, DEFAULT_PADDING } from '../utils/constants';

/**
 * Calculate the center point of the container
 */
function getContainerCenter(width: number, height: number): Point {
  return {
    x: width / 2,
    y: height / 2,
  };
}

/**
 * Calculate the maximum node dimensions
 */
function getMaxNodeDimensions(nodes: NodeData[]): { maxWidth: number; maxHeight: number } {
  const maxWidth = Math.max(...nodes.map((n) => n.size?.width ?? DEFAULT_NODE_SIZE.width));
  const maxHeight = Math.max(...nodes.map((n) => n.size?.height ?? DEFAULT_NODE_SIZE.height));
  return { maxWidth, maxHeight };
}

/**
 * Calculate radius for circular layout
 */
function calculateCircleRadius(
  width: number,
  height: number,
  padding: number,
  maxNodeWidth: number,
  maxNodeHeight: number
): number {
  return Math.max(
    0,
    Math.min(width, height) / 2 - padding - Math.max(maxNodeWidth, maxNodeHeight) / 2
  );
}

/**
 * Position a single node in the center
 */
function positionSingleNode(node: NodeData, centerX: number, centerY: number): PositionedNode {
  const nodeWidth = node.size?.width ?? DEFAULT_NODE_SIZE.width;
  const nodeHeight = node.size?.height ?? DEFAULT_NODE_SIZE.height;
  return {
    ...node,
    position: {
      x: centerX - nodeWidth / 2,
      y: centerY - nodeHeight / 2,
    },
  } as PositionedNode;
}

/**
 * Calculate position on a circle for a node at given index
 */
function calculateCircularPosition(
  index: number,
  total: number,
  centerX: number,
  centerY: number,
  radius: number,
  nodeWidth: number,
  nodeHeight: number
): Point {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    x: centerX + radius * Math.cos(angle) - nodeWidth / 2,
    y: centerY + radius * Math.sin(angle) - nodeHeight / 2,
  };
}

/**
 * Layout nodes in a circular pattern around the center
 */
export function centeredLayout(
  nodes: NodeData[],
  pad: number = DEFAULT_PADDING,
  width: number = 960,
  height: number = 720
): PositionedNode[] {
  const count = nodes.length;

  if (count === 0) return [] as PositionedNode[];

  const { x: centerX, y: centerY } = getContainerCenter(width, height);

  if (count === 1) {
    return [positionSingleNode(nodes[0], centerX, centerY)];
  }

  const { maxWidth, maxHeight } = getMaxNodeDimensions(nodes);
  const radius = calculateCircleRadius(width, height, pad, maxWidth, maxHeight);

  return nodes.map((node, idx) => {
    if (node.position) return node as PositionedNode;

    const nodeWidth = node.size?.width ?? DEFAULT_NODE_SIZE.width;
    const nodeHeight = node.size?.height ?? DEFAULT_NODE_SIZE.height;
    const position = calculateCircularPosition(
      idx,
      count,
      centerX,
      centerY,
      radius,
      nodeWidth,
      nodeHeight
    );

    return { ...node, position } as PositionedNode;
  });
}
