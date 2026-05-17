import type { SquashPlayerRowProps } from '../../types/squashNode';
import { getPlayerBadgeText, truncateText } from '../../utils/squash';
import { SquashSvgScoreSegments } from './SquashSvgScoreSegments';

type SquashPlayerSvgRowProps = SquashPlayerRowProps & {
  readonly rowY: number;
  readonly rowHeight: number;
  readonly nodeWidth: number;
  readonly insetX: number;
  readonly badgeSize: number;
  readonly badgePad: number;
  readonly badgeFontSize: number;
  readonly nameFontSize: number;
  readonly bodyFontFamily: string;
  readonly playerTextX: number;
  readonly maxNameLength: number;
  readonly scoreGroupLeftX: number;
  readonly internalDividerX: number;
  readonly matchCountX: number;
  readonly scoreSegW: number;
  readonly scoreSegG: number;
  readonly scoreFontSize: number;
  readonly scoreFontFamily: string;
  readonly matchCountFontSize: number;
  readonly badgeRadius: number;
};

export function SquashPlayerSvgRow(props: SquashPlayerSvgRowProps) {
  const { player, playerIndex, colors, isWinner, isPlayerHovered, playerOpacity } = props;
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
        rx={props.badgeRadius}
        ry={props.badgeRadius}
        fill={badgeFill}
      />
      <text
        x={props.insetX + props.badgeSize / 2}
        y={props.rowHeight / 2}
        textAnchor="middle"
        dy="0.35em"
        fontSize={props.badgeFontSize}
        fontWeight={700}
        fill={badgeTextColor}
        fontFamily={props.bodyFontFamily}
      >
        {getPlayerBadgeText(player)}
      </text>
      <text
        x={props.playerTextX}
        y={props.rowHeight / 2}
        dy="0.35em"
        fontSize={props.nameFontSize}
        fontWeight={isWinner ? 600 : 500}
        fill={props.textColor}
        fontFamily={props.bodyFontFamily}
      >
        {truncateText(player.name, props.maxNameLength)}
      </text>
      <line
        x1={props.internalDividerX}
        y1={props.rowHeight / 2 - 8}
        x2={props.internalDividerX}
        y2={props.rowHeight / 2 + 8}
        stroke={colors.DARK_BORDER}
        strokeWidth={1}
      />
      <SquashSvgScoreSegments {...props} />
      <text
        x={props.matchCountX}
        y={props.rowHeight / 2}
        textAnchor="middle"
        dy="0.35em"
        fontSize={props.matchCountFontSize}
        fontWeight={700}
        fill={props.textColor}
        fontFamily={props.bodyFontFamily}
      >
        {props.setCount}
      </text>
    </g>
  );
}
