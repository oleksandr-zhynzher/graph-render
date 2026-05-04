import { NodeData } from '@graph-render/types';
import { DEFAULT_NODE_SIZE } from './constants';

export const getMaxNodeWidth = (nodes: NodeData[]): number => {
  return nodes.reduce((max, node) => Math.max(max, node.size?.width ?? DEFAULT_NODE_SIZE.width), 0);
};

export const getMaxNodeHeight = (nodes: NodeData[]): number => {
  return nodes.reduce(
    (max, node) => Math.max(max, node.size?.height ?? DEFAULT_NODE_SIZE.height),
    0
  );
};

export const getMaxNodeDimensions = (
  nodes: NodeData[]
): { maxWidth: number; maxHeight: number } => ({
  maxWidth: getMaxNodeWidth(nodes),
  maxHeight: getMaxNodeHeight(nodes),
});
