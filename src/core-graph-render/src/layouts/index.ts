import { PositionedNode, LayoutOptions, LayoutType, LayoutDirection } from '@graph-render/types';
import { DEFAULT_NODE_GAP, DEFAULT_PADDING, applyNodeSizing } from '../utils';
import { gridLayout } from './grid';
import { centeredLayout } from './centered';
import { radialTreeLayout } from './radialTree';
import { treeLayout } from './tree';
import { dagLayout } from './dag';
import { forceDirectedLayout } from './forceDirected';
import { compactBracketLayout } from './compactBracket';
import { orthogonalFlowLayout } from './orthogonalFlow';

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

  if (layout === LayoutType.Radial) {
    return radialTreeLayout(sizedNodes, edges, pad, width, height, gap);
  }

  if (layout === LayoutType.Centered) {
    return centeredLayout(sizedNodes, pad, width, height);
  }

  if (layout === LayoutType.Dag) {
    return dagLayout(sizedNodes, edges, pad, gap, layoutDirection ?? LayoutDirection.LTR, width, height);
  }

  if (layout === LayoutType.ForceDirected) {
    return forceDirectedLayout(sizedNodes, edges, pad, width, height, gap);
  }

  if (layout === LayoutType.CompactBracket) {
    return compactBracketLayout(
      sizedNodes,
      edges,
      pad,
      gap,
      layoutDirection ?? LayoutDirection.LTR,
      height
    );
  }

  if (layout === LayoutType.OrthogonalFlow) {
    return orthogonalFlowLayout(
      sizedNodes,
      edges,
      pad,
      gap,
      layoutDirection ?? LayoutDirection.LTR,
      height
    );
  }

  return gridLayout(sizedNodes, pad, gap);
};

export {
  gridLayout,
  centeredLayout,
  radialTreeLayout,
  treeLayout,
  dagLayout,
  forceDirectedLayout,
  compactBracketLayout,
  orthogonalFlowLayout,
};
