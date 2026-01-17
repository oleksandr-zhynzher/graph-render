import React from 'react';
import { buildEdgePath, PositionedEdge } from '@graph-render/core';

export interface EdgePathProps {
  edge: PositionedEdge;
  color: string;
  width: number;
  curveEdges: boolean;
  curveStrength: number;
  isHovered?: boolean;
  hoverColor: string;
  hoverMarker?: string;
  hoverEnabled: boolean;
  hoverStrokeWidth?: number;
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
  isHovered,
  hoverColor,
  hoverMarker,
  hoverEnabled,
  hoverStrokeWidth,
  hitStrokeWidth,
  onHoverChange,
  onClick,
}: EdgePathProps) {
  const d = buildEdgePath(edge, curveEdges, curveStrength);
  if (!d) return null;

  return (
    <>
      <path
        d={d}
        stroke="transparent"
        strokeWidth={hitStrokeWidth ?? width + 8}
        fill="none"
        pointerEvents="stroke"
        onMouseEnter={() => hoverEnabled && onHoverChange?.(true)}
        onMouseLeave={() => hoverEnabled && onHoverChange?.(false)}
      />
      <path
        d={d}
        stroke={isHovered ? hoverColor : color}
        strokeWidth={isHovered ? (hoverStrokeWidth ?? width) : width}
        fill="none"
        markerEnd={
          edge.type === 'directed'
            ? isHovered
              ? (hoverMarker ?? 'url(#arrow-hover)')
              : 'url(#arrow)'
            : undefined
        }
        pointerEvents="none"
        onClick={onClick}
      />
    </>
  );
}
