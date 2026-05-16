import { LayoutDirection, LayoutType, type PositionedNode } from '@graph-render/types';

import {
  LABEL_PILL_CHAR_WIDTH,
  LABEL_PILL_MAX_CHARS,
  LABEL_PILL_MIN_WIDTH,
  LABEL_PILL_PADDING_X,
} from '../constants/labels';
import { groupPositionedNodesByColumn } from './columns';

export function getLabelPillWidth(label: string): number {
  const charCount = Math.min([...label].length, LABEL_PILL_MAX_CHARS);
  return Math.max(
    LABEL_PILL_MIN_WIDTH,
    charCount * LABEL_PILL_CHAR_WIDTH + LABEL_PILL_PADDING_X * 2
  );
}

export function getEffectiveGraphLabels(
  positionedNodes: readonly PositionedNode[],
  layout: LayoutType,
  layoutDirection: LayoutDirection,
  labels?: readonly string[],
  autoLabels = false
): { readonly orderedXs: readonly number[]; readonly orderedLabels: readonly string[] } {
  const columns = groupPositionedNodesByColumn(positionedNodes);
  const xs = columns.map((column) => column.centerX);

  if (xs.length === 0) {
    return { orderedXs: [], orderedLabels: [] };
  }

  const levelCounts = columns.map((column) => column.nodes.length);
  const inferred = levelCounts.map((count) => {
    const denom = count * 2;
    if (denom <= 2) return 'Final';
    return `1/${denom}`;
  });

  const effectiveLabels = labels?.length ? labels : autoLabels ? inferred : [];
  const isRTL = layout === LayoutType.Tree && layoutDirection === LayoutDirection.RTL;
  const orderedXs = isRTL ? [...xs].reverse() : xs;
  const orderedLabels = isRTL ? [...effectiveLabels].reverse() : effectiveLabels;

  return { orderedXs, orderedLabels };
}
