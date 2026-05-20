import { groupPositionedNodesByColumn } from '@graph-render/react';
import type { PositionedNode } from '@graph-render/types';
import type { StageView } from '@graph-render/types/tournament';

import { NODE_DIMENSIONS } from '../constants';
import { STAGE_LABEL_HEIGHT } from '../constants/stageNavigation';

export function buildStageViews(
  nodes: readonly PositionedNode[],
  labels: readonly string[],
  labelOffset: number
): readonly StageView[] {
  return groupPositionedNodesByColumn(nodes).map((column, index) => {
    const columnNodes = column.nodes;
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    const nodeIds: string[] = [];
    for (const node of columnNodes) {
      const nx = node.position.x;
      const ny = node.position.y;
      const nw = node.size?.width ?? NODE_DIMENSIONS.WIDTH;
      const nh = node.size?.height ?? NODE_DIMENSIONS.HEIGHT;
      if (nx < minX) minX = nx;
      if (ny < minY) minY = ny;
      if (nx + nw > maxX) maxX = nx + nw;
      if (ny + nh > maxY) maxY = ny + nh;
      nodeIds.push(node.id);
    }
    const labelTop = minY - labelOffset - STAGE_LABEL_HEIGHT + 6;

    return {
      index,
      label: labels[index] ?? `STAGE ${index + 1}`,
      bounds: {
        minX,
        minY: labelTop,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - labelTop,
      },
      nodeIds,
    };
  });
}
