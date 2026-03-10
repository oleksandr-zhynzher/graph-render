import React from 'react';
import { PositionedNode, LayoutType, LayoutDirection } from '@graph-render/types';

/**
 * Canonical dimensions for column-label pills. Exported so that the parent
 * Graph component can compute label bounds using the same values for fit-view
 * calculations, eliminating the two-source-of-truth problem.
 */
export const LABEL_PILL_WIDTH = 64;
export const LABEL_PILL_HEIGHT = 20;
export const LABEL_PILL_RADIUS = 8;

const LABEL_PILL_FONT_SIZE = 12;
const LABEL_PILL_FONT_WEIGHT = 700;

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
  // Use Math.round() as the Map key to guard against floating-point layout
  // artifacts. Positions like 100.00000001 and 100 represent the same column
  // but would produce separate entries as raw floats.
  const columns = new Map<number, PositionedNode[]>();
  positionedNodes.forEach((node) => {
    const colKey = Math.round(node.position.x);
    const column = columns.get(colKey) ?? [];
    column.push(node);
    columns.set(colKey, column);
  });

  const xs = Array.from(columns.keys()).sort((a, b) => a - b);

  if (!xs.length) return null;

  const levelCounts = xs.map((x) => columns.get(x)?.length ?? 0);

  const inferred = levelCounts.map((count) => {
    const denom = count * 2;
    if (denom <= 2) return 'Final';
    return `1/${denom}`;
  });

  const effectiveLabels = labels && labels.length ? labels : autoLabels ? inferred : [];

  if (!effectiveLabels.length) return null;

  const minY = Math.min(...positionedNodes.map((n) => n.position.y));
  const y = minY - labelOffset;
  const orderedXs =
    layout === LayoutType.Tree && layoutDirection === LayoutDirection.RTL ? [...xs].reverse() : xs;
  const orderedLabels =
    layout === LayoutType.Tree && layoutDirection === LayoutDirection.RTL
      ? [...effectiveLabels].reverse()
      : effectiveLabels;

  return (
    <g aria-label="labels">
      {orderedXs.map((x, idx) => {
        const label = orderedLabels[idx] ?? '';
        const nodeWidth = columns.get(x)?.[0]?.size?.width ?? 0;
        const cx = x + nodeWidth / 2;

        return (
          <g
            key={`col-${x}`}
            transform={`translate(${cx - LABEL_PILL_WIDTH / 2}, ${y - LABEL_PILL_HEIGHT + 6})`}
          >
            <rect
              width={LABEL_PILL_WIDTH}
              height={LABEL_PILL_HEIGHT}
              rx={LABEL_PILL_RADIUS}
              ry={LABEL_PILL_RADIUS}
              fill={pillBackground}
              stroke={pillBorderColor}
              strokeWidth={1}
            />
            <text
              x={LABEL_PILL_WIDTH / 2}
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
