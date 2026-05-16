import type { GraphViewport, PositionedNode } from '@graph-render/types';

import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from '../constants/graph';
import type { GraphBounds } from '../models/utils';

export const clampZoom = (zoom: number, minZoom: number, maxZoom: number): number => {
  return Math.min(Math.max(zoom, minZoom), maxZoom);
};

export const normalizeViewport = (
  viewport: GraphViewport,
  minZoom: number,
  maxZoom: number
): GraphViewport => ({
  x: Number.isFinite(viewport.x) ? viewport.x : 0,
  y: Number.isFinite(viewport.y) ? viewport.y : 0,
  zoom: clampZoom(Number.isFinite(viewport.zoom) ? viewport.zoom : 1, minZoom, maxZoom),
});

/**
 * Clamps viewport x/y so the user cannot pan outside the given world-space extent.
 * When the content fits entirely in the container, it is centered instead.
 */
export const clampViewportTranslation = (
  viewport: GraphViewport,
  translateExtent: readonly [readonly [number, number], readonly [number, number]],
  containerWidth: number,
  containerHeight: number
): GraphViewport => {
  const [[xMin, yMin], [xMax, yMax]] = translateExtent;
  const { zoom } = viewport;
  const worldW = xMax - xMin;
  const worldH = yMax - yMin;

  const x =
    worldW * zoom <= containerWidth
      ? containerWidth / 2 - (xMin + worldW / 2) * zoom
      : Math.min(Math.max(viewport.x, containerWidth - xMax * zoom), -xMin * zoom);

  const y =
    worldH * zoom <= containerHeight
      ? containerHeight / 2 - (yMin + worldH / 2) * zoom
      : Math.min(Math.max(viewport.y, containerHeight - yMax * zoom), -yMin * zoom);

  return { zoom, x, y };
};

export const getGraphBounds = (nodes: readonly PositionedNode[]): GraphBounds | null => {
  if (nodes.length === 0) {
    return null;
  }

  return nodes.reduce<GraphBounds>(
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

export { type GraphBounds } from '../models/utils';
