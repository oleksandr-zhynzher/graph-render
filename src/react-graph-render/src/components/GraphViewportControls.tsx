import React, { useMemo } from 'react';
import type { GraphControlsPosition } from '@graph-render/types';
import {
  CONTROL_BUTTON_GAP,
  CONTROL_BUTTON_SIZE,
  CONTROL_LABEL_BUTTON_WIDTH,
} from '../constants/graph';

interface GraphViewportControlsProps {
  width: number;
  height: number;
  position: GraphControlsPosition;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  resetViewport: () => void;
}

const getControlPosition = (
  width: number,
  height: number,
  position: GraphControlsPosition
): { x: number; y: number } => {
  const controlsWidth =
    2 * CONTROL_BUTTON_SIZE + 2 * CONTROL_LABEL_BUTTON_WIDTH + CONTROL_BUTTON_GAP * 3;
  const inset = 12;

  switch (position) {
    case 'top-right':
      return { x: width - controlsWidth - inset, y: inset };
    case 'bottom-left':
      return { x: inset, y: height - CONTROL_BUTTON_SIZE - inset };
    case 'bottom-right':
      return { x: width - controlsWidth - inset, y: height - CONTROL_BUTTON_SIZE - inset };
    case 'top-left':
    default:
      return { x: inset, y: inset };
  }
};

const CONTROL_DEFS = [
  { key: 'zoom-in', label: '+', width: CONTROL_BUTTON_SIZE },
  { key: 'zoom-out', label: '−', width: CONTROL_BUTTON_SIZE },
  { key: 'fit-view', label: 'Fit', width: CONTROL_LABEL_BUTTON_WIDTH },
  { key: 'reset-view', label: '1:1', width: CONTROL_LABEL_BUTTON_WIDTH },
] as const;

const CONTROL_X_POSITIONS = CONTROL_DEFS.reduce<number[]>((acc, def, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + CONTROL_DEFS[i - 1].width + CONTROL_BUTTON_GAP);
  return acc;
}, []);

export const GraphViewportControls = React.memo(function GraphViewportControls({
  width,
  height,
  position,
  zoomIn,
  zoomOut,
  fitView,
  resetViewport,
}: GraphViewportControlsProps) {
  const origin = useMemo(
    () => getControlPosition(width, height, position),
    [height, position, width]
  );
  const callbacks = useMemo(
    () => [zoomIn, zoomOut, fitView, resetViewport] as const,
    [fitView, resetViewport, zoomIn, zoomOut]
  );

  return (
    <g aria-label="viewport-controls" transform={`translate(${origin.x}, ${origin.y})`}>
      {CONTROL_DEFS.map((def, i) => {
        const x = CONTROL_X_POSITIONS[i];
        const onClick = callbacks[i];
        return (
          <g
            key={def.key}
            transform={`translate(${x}, 0)`}
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                onClick();
              }
            }}
          >
            <rect
              width={def.width}
              height={CONTROL_BUTTON_SIZE}
              rx={7}
              ry={7}
              fill="rgba(255,255,255,0.92)"
              stroke="rgba(15,23,42,0.18)"
            />
            <text
              x={def.width / 2}
              y={CONTROL_BUTTON_SIZE / 2 + 4}
              textAnchor="middle"
              fontSize={def.label.length > 1 ? 10 : 16}
              fontWeight={700}
              fill="#0f172a"
            >
              {def.label}
            </text>
          </g>
        );
      })}
    </g>
  );
});
