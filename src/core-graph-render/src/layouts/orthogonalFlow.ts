import {
  type EdgeData,
  LayoutDirection,
  type NodeData,
  type PositionedNode,
} from '@graph-render/types';

import { DEFAULT_NODE_GAP, DEFAULT_NODE_SIZE, DEFAULT_PADDING } from '../utils';
import {
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  VERTICAL_GAP_HEIGHT_RATIO,
  VERTICAL_GAP_MIN,
  VERTICAL_GAP_RATIO,
} from '../utils/constants';
import { assignDagLevels } from './treeTopology';

export const orthogonalFlowLayout = (
  nodes: readonly NodeData[],
  edges: readonly EdgeData[],
  pad: number = DEFAULT_PADDING,
  gap: number = DEFAULT_NODE_GAP,
  direction: LayoutDirection = LayoutDirection.LTR,
  width: number = DEFAULT_WIDTH,
  height: number = DEFAULT_HEIGHT
): readonly PositionedNode[] => {
  if (nodes.length === 0) {
    return [];
  }

  const safePad = Number.isFinite(pad) && pad >= 0 ? pad : DEFAULT_PADDING;
  const safeGap = Number.isFinite(gap) && gap >= 0 ? gap : DEFAULT_NODE_GAP;
  const safeWidth = Number.isFinite(width) && width > 0 ? width : DEFAULT_WIDTH;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : DEFAULT_HEIGHT;

  const { levels } = assignDagLevels(nodes, edges);
  const buckets = new Map<number, NodeData[]>();
  for (const node of nodes) {
    const level = levels.get(node.id);
    if (level == null) {
      throw new Error(`DAG layout could not assign a level to node "${node.id}".`);
    }
    const bucket = buckets.get(level) ?? [];
    bucket.push(node);
    buckets.set(level, bucket);
  }

  const isRTL = direction === LayoutDirection.RTL;

  // Sort columns by level once so per-column x accumulation is deterministic.
  const sortedColumns = [...buckets.entries()].sort((a, b) => a[0] - b[0]);

  // Per-column max node width drives column pitch; avoids a single wide node in
  // one column inflating the spacing of every other column.
  const colMaxWidths = new Map<number, number>(
    sortedColumns.map(([level, levelNodes]) => [
      level,
      levelNodes.reduce(
        (max, node) => Math.max(max, node.size?.width ?? DEFAULT_NODE_SIZE.width),
        0
      ),
    ])
  );

  // Accumulate column x start positions so each column occupies exactly its own
  // content width rather than the global max width.
  const colX = new Map<number, number>();
  if (isRTL) {
    let xCursor = safeWidth - safePad;
    for (const [level] of sortedColumns) {
      xCursor -= colMaxWidths.get(level)!;
      colX.set(level, xCursor);
      xCursor -= safeGap;
    }
  } else {
    let xCursor = safePad;
    for (const [level] of sortedColumns) {
      colX.set(level, xCursor);
      xCursor += colMaxWidths.get(level)! + safeGap;
    }
  }

  return sortedColumns.flatMap(([level, levelNodes]) => {
    const colMaxWidth = colMaxWidths.get(level)!;
    const colStartX = colX.get(level)!;
    const colMaxNodeHeight = levelNodes.reduce(
      (max, node) => Math.max(max, node.size?.height ?? DEFAULT_NODE_SIZE.height),
      0
    );
    // Gap is proportional to both the user-supplied spacing parameter and each
    // column's tallest node so that visually dense columns stay readable.
    const verticalGap = Math.max(
      VERTICAL_GAP_MIN,
      safeGap * VERTICAL_GAP_RATIO,
      colMaxNodeHeight * VERTICAL_GAP_HEIGHT_RATIO
    );
    const contentHeight = levelNodes.reduce(
      (sum, node) => sum + (node.size?.height ?? DEFAULT_NODE_SIZE.height),
      0
    );
    const totalGap = verticalGap * Math.max(levelNodes.length - 1, 0);
    const centeredY = (safeHeight - contentHeight - totalGap) / 2;
    // When content + gaps exceed the available height, centeredY goes negative
    // and the column is top-anchored at safePad instead of disappearing off-canvas.
    const maxY = safeHeight - safePad;
    let y = Math.max(safePad, centeredY);

    return levelNodes.map((node) => {
      const nodeHeight = node.size?.height ?? DEFAULT_NODE_SIZE.height;
      const nodeWidth = node.size?.width ?? DEFAULT_NODE_SIZE.width;
      const position = {
        x: colStartX + (isRTL ? colMaxWidth - nodeWidth : 0),
        y: Math.min(y, maxY - nodeHeight),
      };
      y += nodeHeight + verticalGap;
      return { ...node, position };
    });
  });
};
