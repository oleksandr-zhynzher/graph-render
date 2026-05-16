import React from 'react';

interface GraphNodeFrameProps {
  width: number;
  height: number;
  radius: number;
  borderStroke?: string;
  borderOpacity: number;
  borderWidth: number;
  isFocused: boolean;
  selectionColor: string;
  focusStrokeWidth: number;
}

export const GraphNodeFrame = React.memo(function GraphNodeFrame({
  width,
  height,
  radius,
  borderStroke,
  borderOpacity,
  borderWidth,
  isFocused,
  selectionColor,
  focusStrokeWidth,
}: GraphNodeFrameProps) {
  return (
    <>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill="none"
        stroke={borderStroke}
        strokeOpacity={borderOpacity}
        strokeWidth={borderWidth}
        pointerEvents="none"
      />
      {isFocused ? (
        <rect
          x={-3}
          y={-3}
          width={width + 6}
          height={height + 6}
          rx={radius + 2}
          ry={radius + 2}
          fill="none"
          stroke={selectionColor}
          strokeOpacity={0.7}
          strokeWidth={focusStrokeWidth}
          strokeDasharray="4 3"
          pointerEvents="none"
        />
      ) : null}
    </>
  );
});
