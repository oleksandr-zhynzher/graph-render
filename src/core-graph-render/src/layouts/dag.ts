import { EdgeData, LayoutDirection, NodeData, PositionedNode } from '@graph-render/types';
import { DEFAULT_NODE_GAP, DEFAULT_NODE_SIZE, DEFAULT_PADDING } from '../utils';
import { assertHierarchicalGraph, buildGraphTopology, findRootNodes } from './treeTopology';
import { gridLayout } from './grid';

const assignLayers = (
  nodes: NodeData[],
  edges: EdgeData[]
): { levels: Map<string, number>; outgoing: Map<string, string[]> } => {
  assertHierarchicalGraph(nodes, edges);

  const { incoming, outgoing } = buildGraphTopology(edges);
  const inDegree = new Map<string, number>();
  nodes.forEach((node) => inDegree.set(node.id, incoming.get(node.id) ?? 0));

  const levels = new Map<string, number>();
  const queue = findRootNodes(nodes, incoming);
  queue.forEach((id) => levels.set(id, 0));

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const currentLevel = levels.get(current) ?? 0;

    (outgoing.get(current) ?? []).forEach((child) => {
      const nextLevel = Math.max(levels.get(child) ?? 0, currentLevel + 1);
      levels.set(child, nextLevel);
      const nextInDegree = (inDegree.get(child) ?? 0) - 1;
      inDegree.set(child, nextInDegree);
      if (nextInDegree === 0) {
        queue.push(child);
      }
    });
  }

  return { levels, outgoing };
};

const groupNodesByLayer = (nodes: NodeData[], levels: Map<string, number>): NodeData[][] => {
  const buckets = new Map<number, NodeData[]>();
  nodes.forEach((node) => {
    const level = levels.get(node.id) ?? 0;
    const entries = buckets.get(level) ?? [];
    entries.push(node);
    buckets.set(level, entries);
  });

  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, entries]) => entries);
};

export const dagLayout = (
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

  try {
    const { levels } = assignLayers(nodes, edges);
    const layers = groupNodesByLayer(nodes, levels);
    const maxNodeWidth = Math.max(
      ...nodes.map((node) => node.size?.width ?? DEFAULT_NODE_SIZE.width)
    );
    const maxNodeHeight = Math.max(
      ...nodes.map((node) => node.size?.height ?? DEFAULT_NODE_SIZE.height)
    );
    const columnGap = maxNodeWidth + gap;
    const rowGap = maxNodeHeight + Math.max(24, gap * 0.7);
    const contentWidth = Math.max(width - pad * 2, columnGap * Math.max(layers.length - 1, 1));
    const baseX = direction === LayoutDirection.RTL ? width - pad - maxNodeWidth : pad;
    const stepX = direction === LayoutDirection.RTL ? -columnGap : columnGap;

    return layers.flatMap((layer, layerIndex) => {
      const totalHeight = layer.reduce(
        (sum, node, index) =>
          sum +
          (node.size?.height ?? DEFAULT_NODE_SIZE.height) +
          (index > 0 ? rowGap - maxNodeHeight : 0),
        0
      );
      let y = Math.max(pad, (height - totalHeight) / 2);

      return layer.map((node, nodeIndex) => {
        const nodeWidth = node.size?.width ?? DEFAULT_NODE_SIZE.width;
        const x =
          baseX +
          layerIndex * stepX +
          (direction === LayoutDirection.RTL ? maxNodeWidth - nodeWidth : 0);
        const positioned = {
          ...node,
          position: {
            x: layers.length > 1 ? x : pad + Math.max(0, (contentWidth - nodeWidth) / 2),
            y,
          },
        } as PositionedNode;

        y +=
          (node.size?.height ?? DEFAULT_NODE_SIZE.height) +
          (nodeIndex < layer.length - 1 ? rowGap - maxNodeHeight : 0);
        return positioned;
      });
    });
  } catch {
    return gridLayout(nodes, pad, gap);
  }
};
