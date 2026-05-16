import { getPlayerBadgeText } from '../../utils/squash';
import { BODY_FONT_FAMILY } from './constants';
import { SquashHtmlScoreSegments } from './SquashHtmlScoreSegments';
import type { SquashPlayerRowProps } from './types';

type SquashPlayerHtmlRowProps = SquashPlayerRowProps & {
  readonly nodeHeight: number;
  readonly scoreGroupWidth: number;
};

export function SquashPlayerHtmlRow(props: SquashPlayerHtmlRowProps) {
  const { player, playerIndex, compact, colors, isWinner, isPlayerHovered, playerOpacity } = props;
  const badgeBackground = isWinner ? colors.WINNER_CREST_BG : colors.CREST_BG;
  const badgeColor = isWinner ? colors.WINNER_CREST_TEXT : colors.CREST_TEXT;
  const rowBackground = isPlayerHovered ? colors.ROW_HOVER_BG : colors.ROW_BG;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `${compact ? 16 : 28}px minmax(0, 1fr) ${props.scoreGroupWidth}px ${compact ? 12 : 24}px`,
        alignItems: 'center',
        gap: compact ? 4 : 8,
        padding: compact ? '4px 6px' : '14px 12px',
        minHeight: props.nodeHeight / 2,
        background: rowBackground,
        opacity: playerOpacity,
        transition: 'background-color 140ms ease',
        borderTop: playerIndex === 1 ? `1px solid ${colors.BORDER}` : 'none',
        boxSizing: 'border-box',
      }}
      onMouseEnter={() => props.onPlayerEnter(playerIndex, player)}
      onMouseLeave={props.onPlayerLeave}
    >
      <div
        style={{
          width: compact ? 16 : 28,
          height: compact ? 16 : 28,
          borderRadius: compact ? 3 : 7,
          background: badgeBackground,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          color: badgeColor,
          fontSize: compact ? 8 : 12,
          lineHeight: 1,
          flexShrink: 0,
          fontFamily: BODY_FONT_FAMILY,
        }}
        aria-label={`crest-${player.name}`}
      >
        {getPlayerBadgeText(player)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span
          style={{
            fontSize: compact ? 9 : 13,
            fontWeight: isWinner ? 600 : 500,
            color: props.textColor,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: BODY_FONT_FAMILY,
          }}
        >
          {player.name}
        </span>
      </div>
      <SquashHtmlScoreSegments {...props} />
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 20,
          borderLeft: `1px solid ${colors.DARK_BORDER}`,
          fontSize: compact ? 11 : 18,
          fontWeight: 700,
          color: props.textColor,
          fontFamily: BODY_FONT_FAMILY,
          paddingLeft: compact ? 3 : 8,
        }}
      >
        {props.setCount}
      </span>
    </div>
  );
}
