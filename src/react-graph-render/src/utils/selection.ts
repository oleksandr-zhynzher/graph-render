import type { PositionedEdge, PositionedNode } from '@graph-render/types';
import type { SelectionBox, Rect } from '../models/utils';

export const toggleId = (
  values: string[],
  id: string,
  selectionMode: 'single' | 'multiple'
): string[] => {
  if (selectionMode === 'single') {
    return values.length === 1 && values[0] === id ? [] : [id];
  }

  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
};

export const normalizeRect = (box: SelectionBox): Rect => ({
  x: Math.min(box.startX, box.endX),
  y: Math.min(box.startY, box.endY),
  width: Math.abs(box.endX - box.startX),
  height: Math.abs(box.endY - box.startY),
});

export const isPointInsideRect = (x: number, y: number, rect: Rect): boolean => {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
};

export const getMarqueeSelection = (
  box: SelectionBox,
  viewport: { x: number; y: number; zoom: number },
  nodes: PositionedNode[],
  edges: PositionedEdge[]
): { nodeIds: string[]; edgeIds: string[] } => {
  const rect = normalizeRect(box);
  const worldRect = {
    x: (rect.x - viewport.x) / viewport.zoom,
    y: (rect.y - viewport.y) / viewport.zoom,
    width: rect.width / viewport.zoom,
    height: rect.height / viewport.zoom,
  };

  const nodeIds = nodes
    .filter((node) => {
      const width = node.size?.width ?? 0;
      const height = node.size?.height ?? 0;
      return !(
        node.position.x + width < worldRect.x ||
        node.position.x > worldRect.x + worldRect.width ||
        node.position.y + height < worldRect.y ||
        node.position.y > worldRect.y + worldRect.height
      );
    })
    .map((node) => node.id);

  const edgeIds = edges
    .filter((edge) => {
      const inPoints = edge.points.some((point) => isPointInsideRect(point.x, point.y, worldRect));
      const inLabel =
        !!edge.labelPosition &&
        isPointInsideRect(edge.labelPosition.x, edge.labelPosition.y, worldRect);
      return inPoints || inLabel;
    })
    .map((edge) => edge.id);

  return { nodeIds, edgeIds };
};
