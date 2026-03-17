import { EdgeData, LayoutDirection, NodeData, PositionedNode } from '@graph-render/types';
import {
  DEFAULT_NODE_GAP,
  DEFAULT_NODE_SIZE,
  DEFAULT_PADDING,
  getMaxNodeDimensions,
} from '../utils';
import { assignDagLevels } from './treeTopology';

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

  const { levels } = assignDagLevels(nodes, edges);
  const layers = groupNodesByLayer(nodes, levels);
  const { maxWidth: maxNodeWidth, maxHeight: maxNodeHeight } = getMaxNodeDimensions(nodes);
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
};
