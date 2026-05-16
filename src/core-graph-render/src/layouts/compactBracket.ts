import {
  type EdgeData,
  LayoutDirection,
  type NodeData,
  type PositionedNode,
} from '@graph-render/types';

import { DEFAULT_NODE_GAP, DEFAULT_PADDING } from '../utils';
import { treeLayout } from './tree';

export const compactBracketLayout = (
  nodes: readonly NodeData[],
  edges: readonly EdgeData[],
  pad: number = DEFAULT_PADDING,
  gap: number = DEFAULT_NODE_GAP,
  direction: LayoutDirection = LayoutDirection.LTR,
  height?: number
): readonly PositionedNode[] => {
  return treeLayout(nodes, edges, pad, Math.max(28, gap * 0.55), direction, height);
};
