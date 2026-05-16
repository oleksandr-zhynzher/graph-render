import type { NodeData } from '@graph-render/types';

import { DEFAULT_NODE_SIZE } from './constants';

export const getMaxNodeWidth = (nodes: readonly NodeData[]): number => {
  return nodes.reduce((max, node) => Math.max(max, node.size?.width ?? DEFAULT_NODE_SIZE.width), 0);
};

export const getMaxNodeHeight = (nodes: readonly NodeData[]): number => {
  return nodes.reduce(
    (max, node) => Math.max(max, node.size?.height ?? DEFAULT_NODE_SIZE.height),
    0
  );
};

export const getMaxNodeDimensions = (
  nodes: readonly NodeData[]
): { readonly maxWidth: number; readonly maxHeight: number } => ({
  maxWidth: getMaxNodeWidth(nodes),
  maxHeight: getMaxNodeHeight(nodes),
});
