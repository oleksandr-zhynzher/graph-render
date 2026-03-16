import React from 'react';
import { PositionedNode, LayoutType, LayoutDirection } from '@graph-render/types';
import { groupPositionedNodesByColumn } from '../utils/columns';

/**
 * Canonical dimensions for column-label pills. Exported so that the parent
 * Graph component can compute label bounds using the same values for fit-view
 * calculations, eliminating the two-source-of-truth problem.
 */
export const LABEL_PILL_MIN_WIDTH = 64;
export const LABEL_PILL_HEIGHT = 20;
export const LABEL_PILL_RADIUS = 8;
const LABEL_PILL_PADDING_X = 12;
const LABEL_PILL_CHAR_WIDTH = 7;

const LABEL_PILL_FONT_SIZE = 12;
const LABEL_PILL_FONT_WEIGHT = 700;

export function getLabelPillWidth(label: string): number {
  return Math.max(
    LABEL_PILL_MIN_WIDTH,
    label.length * LABEL_PILL_CHAR_WIDTH + LABEL_PILL_PADDING_X * 2
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
  const orderedXs =
    layout === LayoutType.Tree && layoutDirection === LayoutDirection.RTL ? [...xs].reverse() : xs;
  const orderedLabels =
    layout === LayoutType.Tree && layoutDirection === LayoutDirection.RTL
      ? [...effectiveLabels].reverse()
      : effectiveLabels;

  return { orderedXs, orderedLabels };
}

export interface GraphLabelsProps {
  positionedNodes: PositionedNode[];
  layout: LayoutType;
  layoutDirection: LayoutDirection;
  labels?: string[];
  autoLabels: boolean;
  labelOffset: number;
  /** Background fill of the label pill. Defaults to `#eef1f6`. */
  pillBackground?: string;
  /** Border stroke of the label pill. Defaults to `#d7dbe3`. */
  pillBorderColor?: string;
  /** Text color inside the label pill. Defaults to `#3f434b`. */
  pillTextColor?: string;
}

export function GraphLabels({
  positionedNodes,
  layout,
  layoutDirection,
  labels,
  autoLabels,
  labelOffset,
  pillBackground = '#eef1f6',
  pillBorderColor = '#d7dbe3',
  pillTextColor = '#3f434b',
}: GraphLabelsProps) {
  const { orderedXs, orderedLabels } = getEffectiveGraphLabels(
    positionedNodes,
    layout,
    layoutDirection,
    labels,
    autoLabels
  );

  if (!orderedXs.length || !orderedLabels.length) return null;

  const minY = Math.min(...positionedNodes.map((n) => n.position.y));
  const y = minY - labelOffset;

  return (
    <g aria-label="labels">
      {orderedXs.map((x, idx) => {
        const label = orderedLabels[idx] ?? '';
        const pillWidth = getLabelPillWidth(label);
        const cx = x;

        return (
          <g
            key={`col-${x}`}
            transform={`translate(${cx - pillWidth / 2}, ${y - LABEL_PILL_HEIGHT + 6})`}
          >
            <rect
              width={pillWidth}
              height={LABEL_PILL_HEIGHT}
              rx={LABEL_PILL_RADIUS}
              ry={LABEL_PILL_RADIUS}
              fill={pillBackground}
              stroke={pillBorderColor}
              strokeWidth={1}
            />
            <text
              x={pillWidth / 2}
              y={LABEL_PILL_HEIGHT / 2 + 4}
              fill={pillTextColor}
              fontSize={LABEL_PILL_FONT_SIZE}
              fontWeight={LABEL_PILL_FONT_WEIGHT}
              textAnchor="middle"
            >
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
}
