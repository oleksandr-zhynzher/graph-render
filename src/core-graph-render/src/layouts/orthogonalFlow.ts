import { EdgeData, LayoutDirection, NodeData, PositionedNode } from '@graph-render/types';
import { DEFAULT_NODE_GAP, DEFAULT_NODE_SIZE, DEFAULT_PADDING, getMaxNodeWidth } from '../utils';
import { assignDagLevels } from './treeTopology';

const VERTICAL_GAP_RATIO = 0.45;
const VERTICAL_GAP_MIN = 20;
const DEFAULT_WIDTH = 960;
const DEFAULT_HEIGHT = 720;

export const orthogonalFlowLayout = (
  nodes: NodeData[],
  edges: EdgeData[],
  pad: number = DEFAULT_PADDING,
  gap: number = DEFAULT_NODE_GAP,
  direction: LayoutDirection = LayoutDirection.LTR,
  width: number = DEFAULT_WIDTH,
  height: number = DEFAULT_HEIGHT
): PositionedNode[] => {
  if (!nodes.length) {
    return [];
  }

  const safePad = Number.isFinite(pad) && pad >= 0 ? pad : DEFAULT_PADDING;
  const safeGap = Number.isFinite(gap) && gap >= 0 ? gap : DEFAULT_NODE_GAP;
  const safeWidth = Number.isFinite(width) && width > 0 ? width : DEFAULT_WIDTH;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : DEFAULT_HEIGHT;

  const { levels } = assignDagLevels(nodes, edges);
  const buckets = new Map<number, NodeData[]>();
  nodes.forEach((node) => {
    const level = levels.get(node.id);
    if (level == null) {
      throw new Error(`DAG layout could not assign a level to node "${node.id}".`);
    }
    const bucket = buckets.get(level) ?? [];
    bucket.push(node);
    buckets.set(level, bucket);
  });

  const maxNodeWidth = getMaxNodeWidth(nodes);
  const columnGap = maxNodeWidth + safeGap;
  const isRTL = direction === LayoutDirection.RTL;
  const horizontalSign = isRTL ? -1 : 1;
  const baseX = isRTL ? safeWidth - safePad - maxNodeWidth : safePad;
  const verticalGap = Math.max(VERTICAL_GAP_MIN, safeGap * VERTICAL_GAP_RATIO);

  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .flatMap(([level, levelNodes]) => {
      const contentHeight = levelNodes.reduce(
        (sum, node) => sum + (node.size?.height ?? DEFAULT_NODE_SIZE.height),
        0
      );
      const maxY = safeHeight - safePad;
      let y = Math.max(
        safePad,
        (safeHeight - contentHeight - verticalGap * Math.max(levelNodes.length - 1, 0)) / 2
      );

      return levelNodes.map((node) => {
        const nodeHeight = node.size?.height ?? DEFAULT_NODE_SIZE.height;
        const nodeWidth = node.size?.width ?? DEFAULT_NODE_SIZE.width;
        const position = {
          x: baseX + level * columnGap * horizontalSign + (isRTL ? maxNodeWidth - nodeWidth : 0),
          y: Math.min(y, maxY - nodeHeight),
        };
        y += nodeHeight + verticalGap;
        return { ...node, position } as PositionedNode;
      });
    });
};
