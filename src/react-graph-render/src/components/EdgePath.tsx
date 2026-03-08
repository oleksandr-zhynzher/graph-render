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
  selectionMarker?: string;
  hoverMarker?: string;
  hoverEnabled: boolean;
  hoverStrokeWidth?: number;
  selectedStrokeWidth?: number;
  hitStrokeWidth?: number;
  onHoverChange?: (hovered: boolean) => void;
  onClick?: () => void;
}

export function EdgePath({
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
    </>
  );
}
