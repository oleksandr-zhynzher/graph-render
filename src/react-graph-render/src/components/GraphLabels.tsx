import React from 'react';
import type { LayoutDirection, LayoutType, PositionedNode } from '@graph-render/types';
import {
  LABEL_PILL_HEIGHT,
  LABEL_PILL_MIN_WIDTH,
  LABEL_PILL_RADIUS,
  LABEL_PILL_FONT_SIZE,
  LABEL_PILL_FONT_WEIGHT,
} from '../constants/labels';
import { getEffectiveGraphLabels, getLabelPillWidth } from '../utils/graphLabels';

export { LABEL_PILL_HEIGHT, LABEL_PILL_MIN_WIDTH, LABEL_PILL_RADIUS };
export { getEffectiveGraphLabels, getLabelPillWidth };

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

  // FIX: avoid spreading a potentially large array into Math.min, which can
  // throw a RangeError when the argument count exceeds the JS engine limit.
  const minY = positionedNodes.reduce(
    (min, n) => Math.min(min, n.position.y),
    Number.POSITIVE_INFINITY
  );
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
