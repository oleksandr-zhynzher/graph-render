import { EdgeData, LayoutDirection, NodeData, PositionedNode } from '@graph-render/types';
import {
  DEFAULT_NODE_GAP,
  DEFAULT_NODE_SIZE,
  DEFAULT_PADDING,
  getMaxNodeWidth,
} from '../utils';
import { assignDagLevels } from './treeTopology';

export const orthogonalFlowLayout = (
  nodes: NodeData[],
  edges: EdgeData[],
  pad: number = DEFAULT_PADDING,
  gap: number = DEFAULT_NODE_GAP,
  direction: LayoutDirection = LayoutDirection.LTR,
  width: number = 960,
  height: number = 720
): PositionedNode[] => {
  if (!nodes.length) {
    return [];
  }

  const { levels } = assignDagLevels(nodes, edges);
  const buckets = new Map<number, NodeData[]>();
  nodes.forEach((node) => {
    const level = levels.get(node.id) ?? 0;
    buckets.set(level, [...(buckets.get(level) ?? []), node]);
  });

  const maxNodeWidth = getMaxNodeWidth(nodes);
  const columnGap = maxNodeWidth + gap;
  const horizontalSign = direction === LayoutDirection.RTL ? -1 : 1;
  const baseX = direction === LayoutDirection.RTL ? width - pad - maxNodeWidth : pad;

  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .flatMap(([level, levelNodes]) => {
      const contentHeight = levelNodes.reduce(
        (sum, node) => sum + (node.size?.height ?? DEFAULT_NODE_SIZE.height),
        0
      );
      const verticalGap = Math.max(20, gap * 0.45);
      const maxY = height - pad;
      let y = Math.max(
        pad,
        (height - contentHeight - verticalGap * Math.max(levelNodes.length - 1, 0)) / 2
      );

      return levelNodes.map((node) => {
        const nodeHeight = node.size?.height ?? DEFAULT_NODE_SIZE.height;
        const nodeWidth = node.size?.width ?? DEFAULT_NODE_SIZE.width;
        const position = {
          x:
            baseX +
            level * columnGap * horizontalSign +
            (direction === LayoutDirection.RTL ? maxNodeWidth - nodeWidth : 0),
          y: Math.min(y, maxY - nodeHeight),
        };
        y += nodeHeight + verticalGap;
        return { ...node, position } as PositionedNode;
      });
    });
};
