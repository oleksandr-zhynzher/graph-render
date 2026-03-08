import { PositionedNode, LayoutOptions, LayoutType, LayoutDirection } from '@graph-render/types';
import { DEFAULT_NODE_GAP, DEFAULT_PADDING, applyNodeSizing } from '../utils';
import { gridLayout } from './grid';
import { centeredLayout, radialLayout } from './centered';
import { treeLayout } from './tree';

export const layoutNodes = (options: LayoutOptions): PositionedNode[] => {
  const { nodes, edges, padding, theme, layout, width, height, layoutDirection } = options;
  const gap = theme?.nodeGap ?? DEFAULT_NODE_GAP;
  const pad = padding ?? DEFAULT_PADDING;
  const sizedNodes = applyNodeSizing(nodes, options);

  const missingPositions = sizedNodes.some((n) => !n.position);

  if (!missingPositions) {
    return sizedNodes as PositionedNode[];
  }

  if (layout === LayoutType.Tree) {
    return treeLayout(sizedNodes, edges, pad, gap, layoutDirection ?? LayoutDirection.LTR, height);
  }

  if (layout === LayoutType.Centered || layout === LayoutType.Radial) {
    return radialLayout(sizedNodes, pad, width, height);
  }

  return gridLayout(sizedNodes, pad, gap);
};

export { gridLayout, centeredLayout, radialLayout, treeLayout };
