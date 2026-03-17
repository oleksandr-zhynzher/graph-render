import { EdgeData, LayoutDirection, NodeData, PositionedNode } from '@graph-render/types';
import {
  DEFAULT_NODE_GAP,
  DEFAULT_NODE_SIZE,
  DEFAULT_PADDING,
  getMaxNodeWidth,
} from '../utils';
import { assertHierarchicalGraph, buildGraphTopology, findRootNodes } from './treeTopology';

const buildLevels = (nodes: NodeData[], edges: EdgeData[]): Map<string, number> => {
  assertHierarchicalGraph(nodes, edges);
  const { incoming, outgoing } = buildGraphTopology(edges);
  const inDegree = new Map<string, number>();
  const levels = new Map<string, number>();
  nodes.forEach((node) => inDegree.set(node.id, incoming.get(node.id) ?? 0));
  const queue = findRootNodes(nodes, incoming);
  queue.forEach((id) => levels.set(id, 0));

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const currentLevel = levels.get(current) ?? 0;

    (outgoing.get(current) ?? []).forEach((child) => {
      levels.set(child, Math.max(levels.get(child) ?? 0, currentLevel + 1));
      const nextInDegree = (inDegree.get(child) ?? 0) - 1;
      inDegree.set(child, nextInDegree);
      if (nextInDegree === 0) {
        queue.push(child);
      }
    });
  }

  return levels;
};

export const orthogonalFlowLayout = (
  nodes: NodeData[],
  edges: EdgeData[],
  pad: number = DEFAULT_PADDING,
  gap: number = DEFAULT_NODE_GAP,
  direction: LayoutDirection = LayoutDirection.LTR,
  height: number = 720,
  width: number = 960
): PositionedNode[] => {
  if (!nodes.length) {
    return [];
  }

  const levels = buildLevels(nodes, edges);
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
      let y = Math.max(
        pad,
        (height - contentHeight - verticalGap * Math.max(levelNodes.length - 1, 0)) / 2
      );

      return levelNodes.map((node) => {
        const position = {
          x: baseX + level * columnGap * horizontalSign,
          y,
        };
        y += (node.size?.height ?? DEFAULT_NODE_SIZE.height) + verticalGap;
        return { ...node, position } as PositionedNode;
      });
    });
};
