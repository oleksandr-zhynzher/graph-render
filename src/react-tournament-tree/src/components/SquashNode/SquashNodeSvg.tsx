import React from 'react';
import { getScoreGroupWidth, getScoreSegments, normalizePlayerKey } from '../../utils/squash';
import { NODE_BORDER_WIDTH, SCORE_SEGMENT_GAP, SCORE_SEGMENT_WIDTH } from './constants';
import { SquashPlayerSvgRow } from './SquashPlayerSvgRow';
import type { SquashNodeVariantProps } from './types';

export function SquashNodeSvg(props: SquashNodeVariantProps) {
  const { nodeId, nodeWidth, nodeHeight, compact, colors, meta, setWins, winnerIndex } = props;
  const [p1, p2] = meta.players;
  const insetX = compact ? 6 : 14;
  const rowHeight = nodeHeight / 2;
  const badgeSize = compact ? 16 : 28;
  const badgePad = compact ? 4 : 10;
  const scoreSegW = compact ? 12 : SCORE_SEGMENT_WIDTH;
  const scoreSegG = compact ? 3 : SCORE_SEGMENT_GAP;
  const scoreSectionWidth = getScoreGroupWidth(Math.max(meta.sets.length, 1), scoreSegW, scoreSegG);
  const matchCountWidth = compact ? 14 : 22;
  const internalDividerX = nodeWidth - insetX - matchCountWidth - (compact ? 6 : 10);
  const scoreGroupRightX = internalDividerX - 4;
  const matchCountX = nodeWidth - insetX - matchCountWidth / 2;
  const playerTextX = insetX + badgeSize + badgePad;
  const maxNameWidth = Math.max(
    compact ? 28 : 56,
    scoreGroupRightX - scoreSectionWidth - playerTextX - 4
  );
  const maxNameLength = Math.max(compact ? 6 : 10, Math.floor(maxNameWidth / (compact ? 6 : 7)));
  const clipId = `ds-${nodeId.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <rect width={nodeWidth} height={nodeHeight} rx={compact ? 8 : 16} ry={compact ? 8 : 16} />
        </clipPath>
      </defs>
      <rect
        width={nodeWidth}
        height={nodeHeight}
        rx={compact ? 8 : 16}
        ry={compact ? 8 : 16}
        fill={props.isHovered ? colors.HOVER_BG : colors.BASE_BG}
        stroke={colors.CARD_BORDER}
        strokeWidth={NODE_BORDER_WIDTH}
      />

      {meta.status === 'live' ? (
        <g transform={`translate(${nodeWidth - 18}, 14)`}>
          <circle r={4} fill={colors.LIVE_INDICATOR} />
        </g>
      ) : null}

      <g clipPath={`url(#${clipId})`}>
        {[p1, p2].map((player, playerIndex) => {
          const isWinner = winnerIndex === playerIndex;
          const isPathMatch =
            props.isNodeInActivePath &&
            props.normalizedActivePathKey !== null &&
            normalizePlayerKey(player.name) === props.normalizedActivePathKey;
          const textColor = isWinner ? colors.FOREGROUND : colors.MUTED_TEXT;

          return (
            <SquashPlayerSvgRow
              key={`${nodeId}-svg-p-${playerIndex}`}
              {...props}
              player={player}
              playerIndex={playerIndex}
              isWinner={isWinner}
              isPlayerHovered={props.hoveredPlayerIndex === playerIndex || isPathMatch}
              playerOpacity={meta.status === 'upcoming' ? 0.6 : 1}
              setCount={playerIndex === 0 ? setWins.p1 : setWins.p2}
              scoreSegments={getScoreSegments(meta.sets, meta.tiebreaks, playerIndex)}
              textColor={textColor}
              rowY={playerIndex * rowHeight}
              rowHeight={rowHeight}
              insetX={insetX}
              badgeSize={badgeSize}
              badgePad={badgePad}
              playerTextX={playerTextX}
              maxNameLength={maxNameLength}
              scoreGroupLeftX={scoreGroupRightX - scoreSectionWidth}
              internalDividerX={internalDividerX}
              matchCountX={matchCountX}
              scoreSegW={scoreSegW}
              scoreSegG={scoreSegG}
            />
          );
        })}

        <line
          x1={0}
          y1={rowHeight}
          x2={nodeWidth}
          y2={rowHeight}
          stroke={colors.BORDER}
          strokeWidth={1}
        />
      </g>
    </g>
  );
}
