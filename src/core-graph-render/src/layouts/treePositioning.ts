import { NodeData, TreeMetrics, LayoutDirection } from '@graph-render/types';
import { DEFAULT_NODE_SIZE } from '../utils';

/**
 * Calculate tree layout metrics
 */
export const calculateTreeMetrics = (
  nodes: NodeData[],
  levels: string[][],
  gap: number,
  padding: number,
  containerHeight?: number
): TreeMetrics => {
  const maxLevel = levels.length ? levels.length - 1 : 0;
  const maxNodeHeight = Math.max(...nodes.map((n) => n.size?.height ?? DEFAULT_NODE_SIZE.height));
  const maxLevelCount = Math.max(1, ...levels.map((l) => l?.length ?? 0));
  const totalHeight = maxLevelCount * maxNodeHeight + (maxLevelCount - 1) * gap;
  const baseY =
    containerHeight != null ? Math.max(padding, (containerHeight - totalHeight) / 2) : padding;

  return { maxLevel, maxNodeHeight, maxLevelCount, totalHeight, baseY };
};

/**
 * Calculate X position based on level and direction
 */
export const calculateXPosition = (
  level: number,
  maxLevel: number,
  nodeWidth: number,
  gap: number,
  padding: number,
  direction: LayoutDirection
): number => {
  const ltrX = padding + level * (nodeWidth + gap);
  const rtlX = padding + (maxLevel - level) * (nodeWidth + gap);
  return direction === LayoutDirection.RTL ? rtlX : ltrX;
};

/**
 * Calculate Y position for a node in a level
 */
export const calculateYPosition = (
  nodeIndex: number,
  levelNodes: string[],
  maxNodeHeight: number,
  gap: number,
  totalHeight: number,
  baseY: number
): number => {
  const levelHeight =
    (levelNodes.length || 1) * maxNodeHeight + Math.max(0, (levelNodes.length || 1) - 1) * gap;
  const levelStartY = baseY + (totalHeight - levelHeight) / 2;
  return levelStartY + nodeIndex * (maxNodeHeight + gap);
};
