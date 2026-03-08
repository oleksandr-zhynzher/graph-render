import React from 'react';
import { PositionedNode, LayoutType, LayoutDirection } from '@graph-render/types';

export interface GraphLabelsProps {
  positionedNodes: PositionedNode[];
  layout: LayoutType;
  layoutDirection: LayoutDirection;
  labels?: string[];
  autoLabels: boolean;
  labelOffset: number;
}

export function GraphLabels({
  positionedNodes,
  layout,
  layoutDirection,
  labels,
  autoLabels,
  labelOffset,
}: GraphLabelsProps) {
  const columns = new Map<number, PositionedNode[]>();
  positionedNodes.forEach((node) => {
    const column = columns.get(node.position.x) ?? [];
    column.push(node);
    columns.set(node.position.x, column);
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

  const pillWidth = 64;
  const pillHeight = 20;
  const pillRadius = 8;

  return (
    <g aria-label="labels">
      {orderedXs.map((x, idx) => {
        const label = orderedLabels[idx] ?? '';
        const nodeWidth = columns.get(x)?.[0]?.size?.width ?? 0;
        const cx = x + nodeWidth / 2;

        return (
          <g
            key={`label-${idx}`}
            transform={`translate(${cx - pillWidth / 2}, ${y - pillHeight + 6})`}
          >
            <rect
              width={pillWidth}
              height={pillHeight}
              rx={pillRadius}
              ry={pillRadius}
              fill="#eef1f6"
              stroke="#d7dbe3"
              strokeWidth={1}
            />
            <text
              x={pillWidth / 2}
              y={pillHeight / 2 + 4}
              fill="#3f434b"
              fontSize={12}
              fontWeight={700}
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
