import type { SquashNodeRenderMode } from '@graph-render/types';
import type React from 'react';

import { truncateText } from '../../utils/squash';
import { BODY_FONT_FAMILY } from './constants';
import { isSvgCompatibleRenderMode } from './renderMode';

interface InvalidSquashNodeProps {
  readonly width: number;
  readonly height: number;
  readonly renderMode: SquashNodeRenderMode;
  readonly nodeId: string;
}

export function InvalidSquashNode({
  width,
  height,
  renderMode,
  nodeId,
}: InvalidSquashNodeProps): React.ReactNode {
  if (isSvgCompatibleRenderMode(renderMode)) {
    return (
      <g>
        <rect
          width={width}
          height={height}
          rx={16}
          ry={16}
          fill="#fff7ed"
          stroke="#f97316"
          strokeWidth={2}
        />
        <text
          x={16}
          y={34}
          fontSize={13}
          fontWeight={700}
          fill="#9a3412"
          fontFamily={BODY_FONT_FAMILY}
        >
          Invalid match data
        </text>
        <text x={16} y={56} fontSize={11} fill="#c2410c" fontFamily={BODY_FONT_FAMILY}>
          {truncateText(nodeId, 28)}
        </text>
      </g>
    );
  }

  return (
    <foreignObject width={width} height={height} requiredExtensions="http://www.w3.org/1999/xhtml">
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          borderRadius: 16,
          border: '2px solid #f97316',
          background: '#fff7ed',
          color: '#9a3412',
          padding: '16px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontFamily: BODY_FONT_FAMILY,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700 }}>Invalid match data</div>
        <div style={{ marginTop: 6, fontSize: 11, color: '#c2410c' }}>
          {truncateText(nodeId, 28)}
        </div>
      </div>
    </foreignObject>
  );
}
