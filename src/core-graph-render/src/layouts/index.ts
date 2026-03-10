import { NodeData, PositionedNode, LayoutOptions, LayoutType, LayoutDirection } from '@graph-render/types';
import { DEFAULT_NODE_GAP, DEFAULT_PADDING, applyNodeSizing } from '../utils';
import { gridLayout } from './grid';
import { centeredLayout } from './centered';
import { radialTreeLayout } from './radialTree';
import { treeLayout } from './tree';
import { dagLayout } from './dag';
import { forceDirectedLayout } from './forceDirected';
import { compactBracketLayout } from './compactBracket';
import { orthogonalFlowLayout } from './orthogonalFlow';

const runSelectedLayout = (options: LayoutOptions, sizedNodes: NodeData[]): PositionedNode[] => {
  const { edges, padding, theme, layout, width, height, layoutDirection } = options;
  const gap = theme?.nodeGap ?? DEFAULT_NODE_GAP;
  const pad = padding ?? DEFAULT_PADDING;

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
    return dagLayout(
      sizedNodes,
      edges,
      pad,
      gap,
      layoutDirection ?? LayoutDirection.LTR,
      width,
      height
    );
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
      height,
      width
    );
  }

  return gridLayout(sizedNodes, pad, gap);
};

const getAnchoredLayoutOffset = (
  autoLayout: PositionedNode[],
  fixedNodes: PositionedNode[]
): { x: number; y: number } => {
  if (!fixedNodes.length) {
    return { x: 0, y: 0 };
  }

  const positionedFixed = fixedNodes
    .map((fixedNode) => {
      const laidOut = autoLayout.find((node) => node.id === fixedNode.id);
      return laidOut ? { fixedNode, laidOut } : null;
    })
    .filter((entry): entry is { fixedNode: PositionedNode; laidOut: PositionedNode } => entry !== null);

  if (!positionedFixed.length) {
    return { x: 0, y: 0 };
  }

  const totals = positionedFixed.reduce(
    (acc, entry) => ({
      x: acc.x + (entry.fixedNode.position.x - entry.laidOut.position.x),
      y: acc.y + (entry.fixedNode.position.y - entry.laidOut.position.y),
    }),
    { x: 0, y: 0 }
  );

  return {
    x: totals.x / positionedFixed.length,
    y: totals.y / positionedFixed.length,
  };
};

export const layoutNodes = (options: LayoutOptions): PositionedNode[] => {
  const sizedNodes = applyNodeSizing(options.nodes, options);

  const missingPositions = sizedNodes.some((node) => !node.position);

  if (!missingPositions) {
    return sizedNodes as PositionedNode[];
  }

  const fixedNodes = sizedNodes.filter((node): node is PositionedNode => Boolean(node.position));
  const autoLayoutInput = sizedNodes.map((node) => ({ ...node, position: undefined }));
  const autoLayout = runSelectedLayout(options, autoLayoutInput);
  const offset = getAnchoredLayoutOffset(autoLayout, fixedNodes);
  const fixedNodeMap = new Map(fixedNodes.map((node) => [node.id, node]));

  return autoLayout.map((node) => {
    const fixedNode = fixedNodeMap.get(node.id);
    if (fixedNode) {
      return fixedNode;
    }

    return {
      ...node,
      position: {
        x: node.position.x + offset.x,
        y: node.position.y + offset.y,
      },
    };
  });
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
