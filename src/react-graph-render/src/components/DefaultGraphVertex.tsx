import type { VertexComponentProps } from '@graph-render/types/react';

import {
  DEFAULT_NODE_FILL,
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_RADIUS,
  DEFAULT_NODE_STROKE,
  DEFAULT_NODE_WIDTH,
  DEFAULT_TEXT_FILL,
  DEFAULT_TEXT_SIZE,
} from '../constants/graph';

/** Minimal built-in node renderer for quick starts and demos. */
export function DefaultGraphVertex({
  node,
  nodeFill = DEFAULT_NODE_FILL,
  nodeStroke = DEFAULT_NODE_STROKE,
  nodeTextColor = DEFAULT_TEXT_FILL,
  nodeTextSize = DEFAULT_TEXT_SIZE,
  nodeRadius = DEFAULT_NODE_RADIUS,
  nodeBorderWidth = 1,
  fontFamily = 'system-ui, sans-serif',
}: VertexComponentProps) {
  const width = node.size?.width ?? DEFAULT_NODE_WIDTH;
  const height = node.size?.height ?? DEFAULT_NODE_HEIGHT;
  const label = node.label != null ? String(node.label) : node.id;

  return (
    <>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={nodeRadius}
        ry={nodeRadius}
        fill={nodeFill}
        stroke={nodeStroke}
        strokeWidth={nodeBorderWidth}
      />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={nodeTextColor}
        fontFamily={fontFamily}
        fontSize={nodeTextSize}
      >
        {label}
      </text>
    </>
  );
}

DefaultGraphVertex.displayName = 'DefaultGraphVertex';
