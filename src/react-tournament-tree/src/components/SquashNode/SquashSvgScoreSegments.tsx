import { truncateText } from '../../utils/squash';
import { SCORE_FONT_FAMILY, SCORE_SEPARATOR_HEIGHT } from './constants';
import type { SquashThemeColors } from './types';

interface SquashSvgScoreSegmentsProps {
  readonly nodeId: string;
  readonly playerIndex: number;
  readonly scoreSegments: readonly string[];
  readonly scoreGroupLeftX: number;
  readonly rowHeight: number;
  readonly scoreSegW: number;
  readonly scoreSegG: number;
  readonly textColor: string;
  readonly colors: SquashThemeColors;
  readonly compact: boolean;
}

export function SquashSvgScoreSegments({
  nodeId,
  playerIndex,
  scoreSegments,
  scoreGroupLeftX,
  rowHeight,
  scoreSegW,
  scoreSegG,
  textColor,
  colors,
  compact,
}: SquashSvgScoreSegmentsProps) {
  return (
    <>
      {scoreSegments.map((segment, segmentIndex) => {
        const segmentX = scoreGroupLeftX + scoreSegW / 2 + segmentIndex * (scoreSegW + scoreSegG);
        const dividerX = segmentX + scoreSegW / 2 + scoreSegG / 2;

        return (
          <g key={`${nodeId}-svg-score-${playerIndex}-${segmentIndex}`}>
            <text
              x={segmentX}
              y={rowHeight / 2}
              textAnchor="middle"
              dy="0.35em"
              fontSize={compact ? 8.5 : 10.5}
              fontWeight={400}
              fill={textColor}
              fontFamily={SCORE_FONT_FAMILY}
            >
              {truncateText(segment, 4)}
            </text>
            {segmentIndex < scoreSegments.length - 1 ? (
              <line
                x1={dividerX}
                y1={rowHeight / 2 - SCORE_SEPARATOR_HEIGHT / 2}
                x2={dividerX}
                y2={rowHeight / 2 + SCORE_SEPARATOR_HEIGHT / 2}
                stroke={colors.BORDER}
                strokeWidth={1}
              />
            ) : null}
          </g>
        );
      })}
    </>
  );
}
