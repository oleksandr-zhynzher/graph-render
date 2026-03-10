import React from 'react';
import { buildEdgePath, PositionedEdge } from '@graph-render/core';

export interface EdgePathProps {
  edge: PositionedEdge;
  color: string;
  width: number;
  curveEdges: boolean;
  curveStrength: number;
  markerEnd?: string;
  isHovered?: boolean;
  isSelected?: boolean;
  hoverColor: string;
  selectionColor?: string;
  labelColor?: string;
  selectionMarker?: string;
  hoverMarker?: string;
  hoverEnabled: boolean;
  hoverStrokeWidth?: number;
  selectedStrokeWidth?: number;
  hitStrokeWidth?: number;
  onHoverChange?: (hovered: boolean) => void;
  onClick?: () => void;
}

// Memoised so that unchanged edges are skipped during re-renders of the parent
// Graph component (e.g. when hover/selection state changes for a different edge).
// The caller is responsible for keeping callback props (onHoverChange, onClick)
// referentially stable via useCallback to benefit fully from the bailout.
export const EdgePath = React.memo(function EdgePath({
  edge,
  color,
  width,
  curveEdges,
  curveStrength,
  markerEnd,
  isHovered,
  isSelected,
  hoverColor,
  selectionColor,
  labelColor,
  selectionMarker,
  hoverMarker,
  hoverEnabled,
  hoverStrokeWidth,
  selectedStrokeWidth,
  hitStrokeWidth,
  onHoverChange,
  onClick,
}: EdgePathProps) {
  const d = buildEdgePath(edge, curveEdges, curveStrength);
  if (!d) return null;

  const strokeColor = isHovered ? hoverColor : isSelected ? (selectionColor ?? hoverColor) : color;
  const strokeWidth = isHovered
    ? (hoverStrokeWidth ?? width)
    : isSelected
      ? (selectedStrokeWidth ?? width + 1)
      : width;
  const resolvedMarker = isHovered
    ? (hoverMarker ?? selectionMarker ?? markerEnd)
    : isSelected
      ? (selectionMarker ?? markerEnd)
      : markerEnd;
  const label = edge.label != null && edge.labelPosition ? String(edge.label) : null;

  return (
    <>
      <path
        d={d}
        stroke="transparent"
        strokeWidth={hitStrokeWidth ?? width + 8}
        fill="none"
        pointerEvents="stroke"
        data-graph-edge-interactive="true"
        onMouseEnter={() => hoverEnabled && onHoverChange?.(true)}
        onMouseLeave={() => hoverEnabled && onHoverChange?.(false)}
        onClick={onClick}
      />
      <path
        d={d}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        markerEnd={edge.type === 'directed' ? resolvedMarker : undefined}
        pointerEvents="none"
      />
      {label && edge.labelPosition ? (
        <text
          x={edge.labelPosition.x}
          y={edge.labelPosition.y - 6}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill={labelColor ?? '#334155'}
          pointerEvents="none"
        >
          {label}
        </text>
      ) : null}
    </>
  );
});
