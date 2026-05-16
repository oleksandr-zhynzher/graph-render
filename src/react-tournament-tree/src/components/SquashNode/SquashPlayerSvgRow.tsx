import React from 'react';
import { getPlayerBadgeText, truncateText } from '../../utils/squash';
import { BODY_FONT_FAMILY } from './constants';
import { SquashSvgScoreSegments } from './SquashSvgScoreSegments';
import type { SquashPlayerRowProps } from './types';

type SquashPlayerSvgRowProps = SquashPlayerRowProps & {
  rowY: number;
  rowHeight: number;
  nodeWidth: number;
  insetX: number;
  badgeSize: number;
  badgePad: number;
  playerTextX: number;
  maxNameLength: number;
  scoreGroupLeftX: number;
  internalDividerX: number;
  matchCountX: number;
  scoreSegW: number;
  scoreSegG: number;
};

export function SquashPlayerSvgRow(props: SquashPlayerSvgRowProps) {
  const { player, playerIndex, compact, colors, isWinner, isPlayerHovered, playerOpacity } = props;
  const rowFill = isPlayerHovered ? colors.ROW_HOVER_BG : colors.ROW_BG;
  const badgeFill = isWinner ? colors.WINNER_CREST_BG : colors.CREST_BG;
  const badgeTextColor = isWinner ? colors.WINNER_CREST_TEXT : colors.CREST_TEXT;

  return (
    <g
      transform={`translate(0, ${props.rowY})`}
      opacity={playerOpacity}
      onMouseEnter={() => props.onPlayerEnter(playerIndex, player)}
      onMouseLeave={props.onPlayerLeave}
    >
      <rect x={0} width={props.nodeWidth} height={props.rowHeight} fill={rowFill} />
      <rect
        x={props.insetX}
        y={(props.rowHeight - props.badgeSize) / 2}
        width={props.badgeSize}
        height={props.badgeSize}
        rx={compact ? 4 : 7}
        ry={compact ? 4 : 7}
        fill={badgeFill}
      />
      <text
        x={props.insetX + props.badgeSize / 2}
        y={props.rowHeight / 2}
        textAnchor="middle"
        dy="0.35em"
        fontSize={compact ? 8 : 12}
        fontWeight={700}
        fill={badgeTextColor}
        fontFamily={BODY_FONT_FAMILY}
      >
        {getPlayerBadgeText(player)}
      </text>
      <text
        x={props.playerTextX}
        y={props.rowHeight / 2}
        dy="0.35em"
        fontSize={compact ? 10 : 13}
        fontWeight={isWinner ? 600 : 500}
        fill={props.textColor}
        fontFamily={BODY_FONT_FAMILY}
      >
        {truncateText(player.name, props.maxNameLength)}
      </text>
      <line
        x1={props.internalDividerX}
        y1={props.rowHeight / 2 - 9}
        x2={props.internalDividerX}
        y2={props.rowHeight / 2 + 9}
        stroke={colors.DARK_BORDER}
        strokeWidth={1}
      />
      <SquashSvgScoreSegments {...props} />
      <text
        x={props.matchCountX}
        y={props.rowHeight / 2}
        textAnchor="middle"
        dy="0.35em"
        fontSize={compact ? 14 : 18}
        fontWeight={700}
        fill={props.textColor}
        fontFamily={BODY_FONT_FAMILY}
      >
        {props.setCount}
      </text>
    </g>
  );
}
