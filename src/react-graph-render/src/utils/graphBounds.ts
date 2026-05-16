import {
  LayoutDirection,
  LayoutType,
  type PositionedEdge,
  type PositionedNode,
} from '@graph-render/types';

import { EDGE_LABEL_HEIGHT, EDGE_LABEL_WIDTH } from '../constants/graph';
import { LABEL_PILL_HEIGHT } from '../constants/labels';
import { groupPositionedNodesByColumn } from './columns';
import { getEffectiveGraphLabels, getLabelPillWidth } from './graphLabels';
import type { GraphBounds } from './viewport';

export const expandBounds = (bounds: GraphBounds, margin: number): GraphBounds => ({
  minX: bounds.minX - margin,
  minY: bounds.minY - margin,
  maxX: bounds.maxX + margin,
  maxY: bounds.maxY + margin,
  width: bounds.width + margin * 2,
  height: bounds.height + margin * 2,
});

export const mergeBounds = (
  base: GraphBounds | null,
  next: GraphBounds | null
): GraphBounds | null => {
  if (!base) {
    return next;
  }

  if (!next) {
    return base;
  }

  const minX = Math.min(base.minX, next.minX);
  const minY = Math.min(base.minY, next.minY);
  const maxX = Math.max(base.maxX, next.maxX);
  const maxY = Math.max(base.maxY, next.maxY);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const getLabelBounds = (
  nodes: readonly PositionedNode[],
  layout: LayoutType,
  layoutDirection: LayoutDirection,
  labels: readonly string[] | undefined,
  autoLabels: boolean,
  labelOffset: number
): GraphBounds | null => {
  if (nodes.length === 0 || (!autoLabels && !labels?.length)) {
    return null;
  }

  const columns = groupPositionedNodesByColumn(nodes);
  if (columns.length === 0) {
    return null;
  }

  const orderedColumns =
    layout === LayoutType.Tree && layoutDirection === LayoutDirection.RTL
      ? [...columns].reverse()
      : columns;
  const { orderedLabels } = getEffectiveGraphLabels(
    nodes,
    layout,
    layoutDirection,
    labels,
    autoLabels
  );
  const minY = nodes.reduce(
    (min, node) => Math.min(min, node.position.y),
    Number.POSITIVE_INFINITY
  );
  const topY = minY - labelOffset - LABEL_PILL_HEIGHT + 6;

  return orderedColumns.reduce<GraphBounds | null>((bounds, column, index) => {
    const labelWidth = getLabelPillWidth(orderedLabels[index] ?? '');
    const labelBounds: GraphBounds = {
      minX: column.centerX - labelWidth / 2,
      minY: topY,
      maxX: column.centerX + labelWidth / 2,
      maxY: topY + LABEL_PILL_HEIGHT,
      width: labelWidth,
      height: LABEL_PILL_HEIGHT,
    };

    return mergeBounds(bounds, labelBounds);
  }, null);
};

export const getEdgeLabelBounds = (edges: readonly PositionedEdge[]): GraphBounds | null => {
  return edges.reduce<GraphBounds | null>((bounds, edge) => {
    if (!edge.labelPosition) {
      return bounds;
    }

    const labelBounds: GraphBounds = {
      minX: edge.labelPosition.x - EDGE_LABEL_WIDTH / 2,
      minY: edge.labelPosition.y - EDGE_LABEL_HEIGHT / 2,
      maxX: edge.labelPosition.x + EDGE_LABEL_WIDTH / 2,
      maxY: edge.labelPosition.y + EDGE_LABEL_HEIGHT / 2,
      width: EDGE_LABEL_WIDTH,
      height: EDGE_LABEL_HEIGHT,
    };

    return mergeBounds(bounds, labelBounds);
  }, null);
};
