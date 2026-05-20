import React from 'react';

import { DEFAULT_MARQUEE_FILL, DEFAULT_MARQUEE_STROKE } from '../constants/graph';

interface GraphSelectionOverlayProps {
  readonly rect: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  } | null;
  readonly fill?: string | undefined;
  readonly stroke?: string | undefined;
}

export const GraphSelectionOverlay = React.memo(function GraphSelectionOverlay({
  rect,
  fill = DEFAULT_MARQUEE_FILL,
  stroke = DEFAULT_MARQUEE_STROKE,
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
      fill={fill}
      stroke={stroke}
      strokeDasharray="6 4"
      pointerEvents="none"
    />
  );
});
