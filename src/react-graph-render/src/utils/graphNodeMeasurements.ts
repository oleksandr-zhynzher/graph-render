import type { NodeData, Size } from '@graph-render/types';

export const applyMeasuredNodeSizes = (
  sourceNodes: NodeData[],
  measuredNodeSizes: Record<string, Size>
): NodeData[] =>
  sourceNodes.map((node) => ({
    ...node,
    measuredSize: measuredNodeSizes[node.id] ?? node.measuredSize,
  }));

export const pruneMeasuredNodeSizes = (
  current: Record<string, Size>,
  sourceNodes: NodeData[]
): Record<string, Size> => {
  const validNodeIds = new Set(sourceNodes.map((node) => node.id));
  const nextEntries = Object.entries(current).filter(([nodeId]) => validNodeIds.has(nodeId));
  return nextEntries.length === Object.keys(current).length
    ? current
    : Object.fromEntries(nextEntries);
};
