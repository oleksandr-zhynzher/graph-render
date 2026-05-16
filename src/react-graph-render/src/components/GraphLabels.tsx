import type { LayoutDirection, LayoutType, PositionedNode } from '@graph-render/types';

import {
  LABEL_PILL_FONT_SIZE,
  LABEL_PILL_FONT_WEIGHT,
  LABEL_PILL_HEIGHT,
  LABEL_PILL_RADIUS,
} from '../constants/labels';
import { getEffectiveGraphLabels, getLabelPillWidth } from '../utils/graphLabels';

export interface GraphLabelsProps {
  readonly positionedNodes: readonly PositionedNode[];
  readonly layout: LayoutType;
  readonly layoutDirection: LayoutDirection;
  readonly labels?: readonly string[] | undefined;
  readonly autoLabels: boolean;
  readonly labelOffset: number;
  /** Background fill of the label pill. Defaults to `#eef1f6`. */
  readonly pillBackground?: string | undefined;
  /** Border stroke of the label pill. Defaults to `#d7dbe3`. */
  readonly pillBorderColor?: string | undefined;
  /** Text color inside the label pill. Defaults to `#3f434b`. */
  readonly pillTextColor?: string | undefined;
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

  if (orderedXs.length === 0 || orderedLabels.length === 0) return null;

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

export { LABEL_PILL_HEIGHT, LABEL_PILL_MIN_WIDTH, LABEL_PILL_RADIUS } from '../constants/labels';
export { getEffectiveGraphLabels, getLabelPillWidth } from '../utils/graphLabels';
