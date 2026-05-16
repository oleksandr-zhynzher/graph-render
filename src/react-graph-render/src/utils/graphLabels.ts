import { LayoutDirection, LayoutType, type PositionedNode } from '@graph-render/types';
import { groupPositionedNodesByColumn } from './columns';
import {
  LABEL_PILL_CHAR_WIDTH,
  LABEL_PILL_MAX_CHARS,
  LABEL_PILL_MIN_WIDTH,
  LABEL_PILL_PADDING_X,
} from '../constants/labels';

export function getLabelPillWidth(label: string): number {
  const charCount = Math.min(Array.from(label).length, LABEL_PILL_MAX_CHARS);
  return Math.max(
    LABEL_PILL_MIN_WIDTH,
    charCount * LABEL_PILL_CHAR_WIDTH + LABEL_PILL_PADDING_X * 2
  );
}

export function getEffectiveGraphLabels(
  positionedNodes: PositionedNode[],
  layout: LayoutType,
  layoutDirection: LayoutDirection,
  labels?: string[],
  autoLabels = false
): { orderedXs: number[]; orderedLabels: string[] } {
  const columns = groupPositionedNodesByColumn(positionedNodes);
  const xs = columns.map((column) => column.centerX);

  if (!xs.length) {
    return { orderedXs: [], orderedLabels: [] };
  }

  const levelCounts = columns.map((column) => column.nodes.length);
  const inferred = levelCounts.map((count) => {
    const denom = count * 2;
    if (denom <= 2) return 'Final';
    return `1/${denom}`;
  });

  const effectiveLabels = labels && labels.length ? labels : autoLabels ? inferred : [];
  const isRTL = layout === LayoutType.Tree && layoutDirection === LayoutDirection.RTL;
  const orderedXs = isRTL ? [...xs].reverse() : xs;
  const orderedLabels = isRTL ? [...effectiveLabels].reverse() : effectiveLabels;

  return { orderedXs, orderedLabels };
}
