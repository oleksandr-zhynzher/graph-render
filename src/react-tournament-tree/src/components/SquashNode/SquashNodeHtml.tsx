import { MatchStatus } from '@graph-render/types';

import {
  DEFAULT_PLAYERS,
  NODE_BORDER_WIDTH,
  SCORE_SEGMENT_GAP,
  SCORE_SEGMENT_WIDTH,
} from '../../constants';
import type { SquashNodeVariantProps } from '../../types/squashNode';
import { getScoreGroupWidth, getScoreSegments, normalizePlayerKey } from '../../utils/squash';
import { SquashPlayerHtmlRow } from './SquashPlayerHtmlRow';

export function SquashNodeHtml(props: SquashNodeVariantProps) {
  const { nodeId, nodeWidth, nodeHeight, compact, colors, meta, setWins, winnerIndex } = props;
  const p1 = meta.players[0] ?? DEFAULT_PLAYERS[0] ?? { name: 'TBD', seed: 0 };
  const p2 = meta.players[1] ?? DEFAULT_PLAYERS[1] ?? { name: 'TBD', seed: 0 };
  const scoreGroupWidth = getScoreGroupWidth(
    Math.max(meta.sets.length, 1),
    SCORE_SEGMENT_WIDTH,
    SCORE_SEGMENT_GAP
  );

  return (
    <foreignObject
      width={nodeWidth}
      height={nodeHeight}
      requiredExtensions="http://www.w3.org/1999/xhtml"
    >
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          borderRadius: compact ? 8 : 16,
          background: props.isHovered ? colors.HOVER_BG : colors.BASE_BG,
          border: `${NODE_BORDER_WIDTH}px solid ${colors.CARD_BORDER}`,
          color: colors.FOREGROUND,
          display: 'flex',
          flexDirection: 'column',
          transition: 'background-color 120ms ease, box-shadow 120ms ease',
          transform: 'none',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {meta.status === MatchStatus.Live ? <LiveIndicator color={colors.LIVE_INDICATOR} /> : null}
        <div style={{ display: 'grid', gridTemplateRows: 'repeat(2, 1fr)' }}>
          {[p1, p2].map((player, playerIndex) => {
            const isWinner = winnerIndex === playerIndex;
            const isPathMatch =
              props.isNodeInActivePath &&
              props.normalizedActivePathKey !== null &&
              normalizePlayerKey(player.name) === props.normalizedActivePathKey;

            return (
              <SquashPlayerHtmlRow
                key={`${nodeId}-p-${playerIndex}`}
                {...props}
                player={player}
                playerIndex={playerIndex}
                isWinner={isWinner}
                isPlayerHovered={props.hoveredPlayerIndex === playerIndex || isPathMatch}
                playerOpacity={meta.status === MatchStatus.Upcoming ? 0.6 : 1}
                setCount={playerIndex === 0 ? setWins.p1 : setWins.p2}
                scoreSegments={getScoreSegments(meta.sets, meta.tiebreaks, playerIndex)}
                textColor={isWinner ? colors.FOREGROUND : colors.MUTED_TEXT}
                nodeHeight={nodeHeight}
                scoreGroupWidth={scoreGroupWidth}
              />
            );
          })}
        </div>
      </div>
    </foreignObject>
  );
}

function LiveIndicator({ color }: { readonly color: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontWeight: 700,
        color,
        textTransform: 'uppercase',
      }}
    >
      <span
        data-squash-live-indicator
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: color,
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />
    </div>
  );
}
