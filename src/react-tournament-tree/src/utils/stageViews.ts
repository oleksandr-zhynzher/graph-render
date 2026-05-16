import { groupPositionedNodesByColumn } from '@graph-render/react';
import type { PositionedNode, StageView } from '@graph-render/types';

import { NODE_DIMENSIONS } from '../constants';
import { STAGE_LABEL_HEIGHT } from '../constants/stageNavigation';

export function buildStageViews(
  nodes: readonly PositionedNode[],
  labels: readonly string[],
  labelOffset: number
): readonly StageView[] {
  return groupPositionedNodesByColumn(nodes).map((column, index) => {
    const columnNodes = column.nodes;
    const minX = Math.min(...columnNodes.map((node) => node.position.x));
    const minY = Math.min(...columnNodes.map((node) => node.position.y));
    const maxX = Math.max(
      ...columnNodes.map((node) => node.position.x + (node.size?.width ?? NODE_DIMENSIONS.WIDTH))
    );
    const maxY = Math.max(
      ...columnNodes.map((node) => node.position.y + (node.size?.height ?? NODE_DIMENSIONS.HEIGHT))
    );
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
      nodeIds: columnNodes.map((node) => node.id),
    };
  });
}
