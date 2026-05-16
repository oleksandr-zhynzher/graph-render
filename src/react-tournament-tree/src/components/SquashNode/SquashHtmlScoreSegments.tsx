import React from 'react';
import { truncateText } from '../../utils/squash';
import { SCORE_FONT_FAMILY, SCORE_SEGMENT_WIDTH, SCORE_SEPARATOR_HEIGHT } from './constants';
import type { SquashThemeColors } from './types';

type SquashHtmlScoreSegmentsProps = {
  nodeId: string;
  playerIndex: number;
  scoreSegments: string[];
  textColor: string;
  colors: SquashThemeColors;
};

export function SquashHtmlScoreSegments({
  nodeId,
  playerIndex,
  scoreSegments,
  textColor,
  colors,
}: SquashHtmlScoreSegmentsProps) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        minWidth: 0,
        width: '100%',
        gap: 5,
      }}
    >
      {scoreSegments.map((segment, segmentIndex) => (
        <React.Fragment key={`${nodeId}-html-score-${playerIndex}-${segmentIndex}`}>
          <span
            style={{
              width: SCORE_SEGMENT_WIDTH,
              fontSize: 10.5,
              color: textColor,
              fontFamily: SCORE_FONT_FAMILY,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {truncateText(segment, 4)}
          </span>
          {segmentIndex < scoreSegments.length - 1 ? (
            <span
              style={{
                width: 1,
                height: SCORE_SEPARATOR_HEIGHT,
                background: colors.BORDER,
                flexShrink: 0,
              }}
            />
          ) : null}
        </React.Fragment>
      ))}
    </span>
  );
}
