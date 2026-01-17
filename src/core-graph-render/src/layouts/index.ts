import { PositionedNode, LayoutOptions, LayoutType, LayoutDirection } from '@graph-render/types';
import { DEFAULT_NODE_GAP, DEFAULT_PADDING } from '../utils/constants';
import { gridLayout } from './grid';
import { centeredLayout } from './centered';
import { treeLayout } from './tree';

export function layoutNodes(options: LayoutOptions): PositionedNode[] {
  const { nodes, edges, padding, theme, layout, width, height, layoutDirection } = options;
  const gap = theme?.nodeGap ?? DEFAULT_NODE_GAP;
  const pad = padding ?? DEFAULT_PADDING;

  const missingPositions = nodes.some((n) => !n.position);

  if (!missingPositions) {
    return nodes as PositionedNode[];
  }

  if (layout === LayoutType.Tree) {
    return treeLayout(nodes, edges, pad, gap, layoutDirection ?? LayoutDirection.LTR, height);
  }

  if (layout === LayoutType.Centered) {
    return centeredLayout(nodes, pad, width, height);
  }

  return gridLayout(nodes, pad, gap);
}

export { gridLayout, centeredLayout, treeLayout };
