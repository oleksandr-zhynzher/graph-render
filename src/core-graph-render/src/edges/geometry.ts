import { PositionedNode, Point, Size, NodeSide } from '@graph-render/types';

/**
 * Calculate the center point of a node
 */
export const getNodeCenter = (node: PositionedNode, size: Size): Point => {
  return {
    x: node.position.x + size.width / 2,
    y: node.position.y + size.height / 2,
  };
};

/**
 * Get the point at the center of a node's side
 */
export const getSideCenter = (node: PositionedNode, size: Size, side: NodeSide): Point => {
  const cx = node.position.x + size.width / 2;
  const cy = node.position.y + size.height / 2;
  switch (side) {
    case NodeSide.Left:
      return { x: node.position.x, y: cy };
    case NodeSide.Right:
      return { x: node.position.x + size.width, y: cy };
    case NodeSide.Top:
      return { x: cx, y: node.position.y };
    case NodeSide.Bottom:
      return { x: cx, y: node.position.y + size.height };
  }
};

/**
 * Get anchor point on a node's side with offset and inset
 */
export const getAnchorPoint = (
  node: PositionedNode,
  size: Size,
  side: NodeSide,
  offset: number,
  inset: number
): Point => {
  const cx = node.position.x + size.width / 2;
  const cy = node.position.y + size.height / 2;
  switch (side) {
    case NodeSide.Left:
      return { x: node.position.x - inset, y: cy + offset };
    case NodeSide.Right:
      return { x: node.position.x + size.width + inset, y: cy + offset };
    case NodeSide.Top:
      return { x: cx + offset, y: node.position.y - inset };
    case NodeSide.Bottom:
      return { x: cx + offset, y: node.position.y + size.height + inset };
  }
};

/**
 * Get the normal vector for a given side
 */
export const getSideNormal = (side: NodeSide): Point => {
  switch (side) {
    case NodeSide.Left:
      return { x: -1, y: 0 };
    case NodeSide.Right:
      return { x: 1, y: 0 };
    case NodeSide.Top:
      return { x: 0, y: -1 };
    case NodeSide.Bottom:
      return { x: 0, y: 1 };
  }
};

/**
 * Get the inward normal vector for a given side
 */
export const getSideInwardNormal = (side: NodeSide): Point => {
  switch (side) {
    case NodeSide.Left:
      return { x: 1, y: 0 };
    case NodeSide.Right:
      return { x: -1, y: 0 };
    case NodeSide.Top:
      return { x: 0, y: 1 };
    case NodeSide.Bottom:
      return { x: 0, y: -1 };
  }
};
