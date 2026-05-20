import { GraphControlsPosition } from '@graph-render/types/react';
import React, { useMemo } from 'react';

import {
  CONTROL_BUTTON_GAP,
  CONTROL_BUTTON_SIZE,
  CONTROL_DEFS,
  CONTROL_LABEL_BUTTON_WIDTH,
  CONTROL_X_POSITIONS,
  DEFAULT_CONTROL_FILL,
  DEFAULT_CONTROL_FOCUS_STROKE,
  DEFAULT_CONTROL_STROKE,
  DEFAULT_CONTROL_TEXT_COLOR,
} from '../constants/graph';

interface GraphViewportControlsProps {
  readonly width: number;
  readonly height: number;
  readonly position: GraphControlsPosition;
  readonly fill?: string | undefined;
  readonly stroke?: string | undefined;
  readonly textColor?: string | undefined;
  readonly focusStroke?: string | undefined;
  readonly zoomIn: () => void;
  readonly zoomOut: () => void;
  readonly fitView: () => void;
  readonly resetViewport: () => void;
}

const getControlPosition = (
  width: number,
  height: number,
  position: GraphControlsPosition
): { readonly x: number; readonly y: number } => {
  const controlsWidth =
    2 * CONTROL_BUTTON_SIZE + 2 * CONTROL_LABEL_BUTTON_WIDTH + CONTROL_BUTTON_GAP * 3;
  const inset = 12;

  switch (position) {
    case GraphControlsPosition.TopRight: {
      return { x: width - controlsWidth - inset, y: inset };
    }
    case GraphControlsPosition.BottomLeft: {
      return { x: inset, y: height - CONTROL_BUTTON_SIZE - inset };
    }
    case GraphControlsPosition.BottomRight: {
      return { x: width - controlsWidth - inset, y: height - CONTROL_BUTTON_SIZE - inset };
    }
    default: {
      return { x: inset, y: inset };
    }
  }
};

export const GraphViewportControls = React.memo(function GraphViewportControls({
  width,
  height,
  position,
  fill = DEFAULT_CONTROL_FILL,
  stroke = DEFAULT_CONTROL_STROKE,
  textColor = DEFAULT_CONTROL_TEXT_COLOR,
  focusStroke = DEFAULT_CONTROL_FOCUS_STROKE,
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
      <style>
        {`
          .graph-render-viewport-control:focus-visible > rect {
            stroke: ${focusStroke};
            stroke-width: 2.5px;
          }
        `}
      </style>
      {CONTROL_DEFS.map((def, i) => {
        const x = CONTROL_X_POSITIONS[i];
        const onClick = callbacks[i];
        if (x === undefined || !onClick) {
          return null;
        }
        return (
          <g
            key={def.key}
            transform={`translate(${x}, 0)`}
            role="button"
            className="graph-render-viewport-control"
            tabIndex={0}
            aria-label={def.ariaLabel}
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
              fill={fill}
              stroke={stroke}
            />
            <text
              x={def.width / 2}
              y={CONTROL_BUTTON_SIZE / 2 + 4}
              textAnchor="middle"
              fontSize={def.label.length > 1 ? 10 : 16}
              fontWeight={700}
              fill={textColor}
            >
              {def.label}
            </text>
          </g>
        );
      })}
    </g>
  );
});
