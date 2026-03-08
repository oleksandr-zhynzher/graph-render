import { GraphViewport, PositionedNode } from '@graph-render/types';

export interface GraphBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 72;

export const clampZoom = (zoom: number, minZoom: number, maxZoom: number): number => {
  return Math.min(Math.max(zoom, minZoom), maxZoom);
};

export const getGraphBounds = (nodes: PositionedNode[]): GraphBounds | null => {
  if (!nodes.length) {
    return null;
  }

  const bounds = nodes.reduce<GraphBounds>(
    (acc, node) => {
      const width = node.size?.width ?? DEFAULT_NODE_WIDTH;
      const height = node.size?.height ?? DEFAULT_NODE_HEIGHT;
      const minX = Math.min(acc.minX, node.position.x);
      const minY = Math.min(acc.minY, node.position.y);
      const maxX = Math.max(acc.maxX, node.position.x + width);
      const maxY = Math.max(acc.maxY, node.position.y + height);

      return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
      };
    },
    {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
      width: 0,
      height: 0,
    }
  );

  return bounds;
};

export const getFitViewport = (
  bounds: GraphBounds | null,
  width: number,
  height: number,
  padding: number,
  minZoom: number,
  maxZoom: number
): GraphViewport => {
  if (!bounds || width <= 0 || height <= 0) {
    return { x: 0, y: 0, zoom: 1 };
  }

  const safeWidth = Math.max(bounds.width, 1);
  const safeHeight = Math.max(bounds.height, 1);
  const availableWidth = Math.max(width - padding * 2, 1);
  const availableHeight = Math.max(height - padding * 2, 1);
  const zoom = clampZoom(
    Math.min(availableWidth / safeWidth, availableHeight / safeHeight),
    minZoom,
    maxZoom
  );

  return {
    x: padding + (availableWidth - safeWidth * zoom) / 2 - bounds.minX * zoom,
    y: padding + (availableHeight - safeHeight * zoom) / 2 - bounds.minY * zoom,
    zoom,
  };
};

export const centerViewportOnNode = (
  node: PositionedNode,
  width: number,
  height: number,
  currentZoom: number
): GraphViewport => {
  const nodeWidth = node.size?.width ?? DEFAULT_NODE_WIDTH;
  const nodeHeight = node.size?.height ?? DEFAULT_NODE_HEIGHT;
  const centerX = node.position.x + nodeWidth / 2;
  const centerY = node.position.y + nodeHeight / 2;

  return {
    x: width / 2 - centerX * currentZoom,
    y: height / 2 - centerY * currentZoom,
    zoom: currentZoom,
  };
};
