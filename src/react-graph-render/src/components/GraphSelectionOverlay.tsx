import React from 'react';

interface GraphSelectionOverlayProps {
  readonly rect: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  } | null;
}

export const GraphSelectionOverlay = React.memo(function GraphSelectionOverlay({
  rect,
}: GraphSelectionOverlayProps) {
  if (!rect) {
    return null;
  }

  return (
    <rect
      x={rect.x}
      y={rect.y}
      width={rect.width}
      height={rect.height}
      fill="rgba(59, 130, 246, 0.12)"
      stroke="rgba(59, 130, 246, 0.8)"
      strokeDasharray="6 4"
      pointerEvents="none"
    />
  );
});
