import type { SquashPlayerRowProps } from '../../types/squashNode';
import type { ResolvedMatchCardStyle } from '../../utils/resolveBracketAppearance';
import { getPlayerBadgeText } from '../../utils/squash';
import { SquashHtmlScoreSegments } from './SquashHtmlScoreSegments';

type SquashPlayerHtmlRowProps = SquashPlayerRowProps & {
  readonly nodeHeight: number;
  readonly scoreGroupWidth: number;
  readonly matchCard: ResolvedMatchCardStyle;
  readonly bodyFontFamily: string;
  readonly scoreFontFamily: string;
};

export function SquashPlayerHtmlRow(props: SquashPlayerHtmlRowProps) {
  const { player, playerIndex, colors, isWinner, isPlayerHovered, playerOpacity, matchCard } =
    props;
  const badgeBackground = isWinner ? colors.WINNER_CREST_BG : colors.CREST_BG;
  const badgeColor = isWinner ? colors.WINNER_CREST_TEXT : colors.CREST_TEXT;
  const rowBackground = isPlayerHovered ? colors.ROW_HOVER_BG : colors.ROW_BG;
  const badgeRadius = props.compact ? 3 : 6;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `${matchCard.badgeSize}px minmax(0, 1fr) ${props.scoreGroupWidth}px ${matchCard.matchCountWidth}px`,
        alignItems: 'center',
        gap: matchCard.rowGap,
        padding: matchCard.rowPadding,
        minHeight: props.nodeHeight / 2,
        background: rowBackground,
        opacity: playerOpacity,
        transition: 'background-color 140ms ease',
        borderTop: playerIndex === 1 ? `1px solid ${colors.BORDER}` : 'none',
        boxSizing: 'border-box',
      }}
      onMouseEnter={() => props.onPlayerEnter(playerIndex, player)}
      onMouseLeave={props.onPlayerLeave}
      data-testid="player-html-row"
    >
      <div
        style={{
          width: matchCard.badgeSize,
          height: matchCard.badgeSize,
          borderRadius: badgeRadius,
          background: badgeBackground,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          color: badgeColor,
          fontSize: matchCard.badgeFontSize,
          lineHeight: 1,
          flexShrink: 0,
          fontFamily: props.bodyFontFamily,
        }}
        aria-label={`crest-${player.name}`}
      >
        {getPlayerBadgeText(player)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span
          style={{
            fontSize: matchCard.nameFontSize,
            fontWeight: isWinner ? 600 : 500,
            color: props.textColor,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: props.bodyFontFamily,
          }}
        >
          {player.name}
        </span>
      </div>
      <SquashHtmlScoreSegments
        nodeId={props.nodeId}
        playerIndex={playerIndex}
        scoreSegments={props.scoreSegments}
        textColor={props.textColor}
        colors={colors}
        scoreFontSize={matchCard.score.fontSize}
        scoreSegW={matchCard.score.segmentWidth}
        scoreSegG={matchCard.score.segmentGap}
        scoreFontFamily={props.scoreFontFamily}
      />
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 20,
          borderLeft: `1px solid ${colors.DARK_BORDER}`,
          fontSize: matchCard.score.matchCountFontSize,
          fontWeight: 700,
          color: props.textColor,
          fontFamily: props.bodyFontFamily,
          paddingLeft: props.compact ? 3 : 6,
        }}
      >
        {props.setCount}
      </span>
    </div>
  );
}
