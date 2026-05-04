import React, { useEffect, useState } from 'react';
import type { VertexComponentProps } from '@graph-render/types';
import type { MatchStatus, SquashMatchMeta, SquashNodeRenderMode, SquashPlayer } from '../types';
import { NODE_DIMENSIONS, DEFAULT_PLAYERS } from '../constants';
import { useBracketTheme } from '../contexts/BracketThemeContext';

interface SquashNodeProps extends VertexComponentProps {
  renderMode?: SquashNodeRenderMode;
  onRenderError?: (nodeId: string, error: Error) => void;
}

const isSvgCompatibleRenderMode = (renderMode: SquashNodeRenderMode): boolean => {
  return renderMode === 'svg' || renderMode === 'export' || renderMode === 'server';
};

const SCORE_FONT_FAMILY = '"Space Mono", "SFMono-Regular", ui-monospace, monospace';
const BODY_FONT_FAMILY = '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif';
const SCORE_SEGMENT_WIDTH = 16;
const SCORE_SEGMENT_GAP = 5;
const SCORE_SEPARATOR_HEIGHT = 10;
const NODE_BORDER_WIDTH = 2;

const truncateText = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
};

const isMatchStatus = (value: unknown): value is MatchStatus => {
  return value === 'completed' || value === 'live' || value === 'upcoming';
};

const normalizePlayerKey = (value: string): string => value.trim().toLowerCase();

const normalizePlayer = (value: unknown, label: string): SquashPlayer => {
  if (!value || typeof value !== 'object') {
    throw new TypeError(`Invalid squash match payload: ${label} must be an object.`);
  }

  const player = value as Partial<SquashPlayer>;
  if (typeof player.name !== 'string' || !player.name.trim()) {
    throw new TypeError(`Invalid squash match payload: ${label}.name must be a non-empty string.`);
  }

  if (player.seed != null && (typeof player.seed !== 'number' || !Number.isFinite(player.seed))) {
    throw new TypeError(`Invalid squash match payload: ${label}.seed must be a finite number.`);
  }

  if (player.country != null && (typeof player.country !== 'string' || !player.country.trim())) {
    throw new TypeError(
      `Invalid squash match payload: ${label}.country must be a non-empty string when provided.`
    );
  }

  return {
    name: player.name.trim(),
    seed: player.seed,
    country: player.country?.trim(),
  };
};

const normalizePlayers = (value: unknown): [SquashPlayer, SquashPlayer] => {
  if (value == null) {
    return [DEFAULT_PLAYERS[0], DEFAULT_PLAYERS[1]];
  }

  if (!Array.isArray(value) || value.length !== 2) {
    throw new TypeError('Invalid squash match payload: players must contain exactly two entries.');
  }

  return [normalizePlayer(value[0], 'players[0]'), normalizePlayer(value[1], 'players[1]')];
};

const normalizeScore = (value: unknown, label: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`Invalid squash match payload: ${label} must be a non-negative number.`);
  }

  return value;
};

const normalizeSets = (value: unknown): number[][] => {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new TypeError('Invalid squash match payload: sets must be an array of score pairs.');
  }

  return value.map((entry, index) => {
    if (!Array.isArray(entry) || entry.length !== 2) {
      throw new TypeError(
        `Invalid squash match payload: sets[${index}] must contain exactly two scores.`
      );
    }

    return [
      normalizeScore(entry[0], `sets[${index}][0]`),
      normalizeScore(entry[1], `sets[${index}][1]`),
    ];
  });
};

const normalizeTiebreaks = (value: unknown): (number[] | null)[] => {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new TypeError(
      'Invalid squash match payload: tiebreaks must be an array of score pairs or null entries.'
    );
  }

  return value.map((entry, index) => {
    if (entry == null) {
      return null;
    }

    if (!Array.isArray(entry) || entry.length !== 2) {
      throw new TypeError(
        `Invalid squash match payload: tiebreaks[${index}] must contain exactly two scores or be null.`
      );
    }

    return [
      normalizeScore(entry[0], `tiebreaks[${index}][0]`),
      normalizeScore(entry[1], `tiebreaks[${index}][1]`),
    ];
  });
};

const normalizeMatchMeta = (meta: unknown): Required<SquashMatchMeta> => {
  if (meta != null && typeof meta !== 'object') {
    throw new TypeError('Invalid squash match payload: node meta must be an object when provided.');
  }

  const rawMeta = meta as Partial<SquashMatchMeta> | undefined;
  if (rawMeta?.status != null && !isMatchStatus(rawMeta.status)) {
    throw new TypeError(
      'Invalid squash match payload: status must be one of completed, live, or upcoming.'
    );
  }

  const sets = normalizeSets(rawMeta?.sets);

  return {
    stage:
      typeof rawMeta?.stage === 'string' && rawMeta.stage.trim() ? rawMeta.stage.trim() : 'Stage',
    players: normalizePlayers(rawMeta?.players),
    sets,
    tiebreaks: normalizeTiebreaks(rawMeta?.tiebreaks),
    status: rawMeta?.status ?? 'completed',
    currentSet:
      rawMeta?.currentSet == null
        ? 0
        : typeof rawMeta.currentSet === 'number' && Number.isFinite(rawMeta.currentSet)
          ? Math.max(0, Math.min(Math.floor(rawMeta.currentSet), Math.max(sets.length - 1, 0)))
          : (() => {
              throw new TypeError(
                'Invalid squash match payload: currentSet must be a finite number when provided.'
              );
            })(),
  };
};

function ensureSquashNodeAnimations(): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.querySelector('style[data-squash-node-animations]')) {
    return;
  }

  const styleTag = document.createElement('style');
  styleTag.setAttribute('data-squash-node-animations', 'true');
  styleTag.textContent = `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `;
  document.head.appendChild(styleTag);
}

const getPlayerBadgeText = (player: SquashPlayer): string => {
  const initials = player.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || '–';
};

const getDisplayScores = (
  sets: number[][],
  tiebreaks: (number[] | null)[],
  playerIndex: number
): string[] => {
  return sets.map((setScores, setIndex) => {
    const score = setScores[playerIndex];

    if (!Number.isFinite(score)) {
      return '—';
    }

    const tiebreak = tiebreaks[setIndex];
    const tiebreakValue = tiebreak?.[playerIndex];

    if (typeof tiebreakValue === 'number' && Number.isFinite(tiebreakValue) && tiebreakValue > 0) {
      return `${score}(${tiebreakValue})`;
    }

    return String(score);
  });
};

const getScoreSegments = (
  sets: number[][],
  tiebreaks: (number[] | null)[],
  playerIndex: number
): string[] => {
  const segments = getDisplayScores(sets, tiebreaks, playerIndex);
  return segments.length ? segments : ['—'];
};

const getScoreGroupWidth = (segmentCount: number): number => {
  if (segmentCount <= 0) {
    return SCORE_SEGMENT_WIDTH;
  }

  return segmentCount * SCORE_SEGMENT_WIDTH + Math.max(0, segmentCount - 1) * SCORE_SEGMENT_GAP;
};

const getCompletedWinnerIndex = (
  setWins: { p1: number; p2: number },
  status: MatchStatus
): number | null => {
  if (status !== 'completed') {
    return null;
  }

  if (setWins.p1 === setWins.p2) {
    return null;
  }

  return setWins.p1 > setWins.p2 ? 0 : 1;
};

type SquashNodeErrorBoundaryProps = {
  nodeId: string;
  renderMode: SquashNodeRenderMode;
  width: number;
  height: number;
  onRenderError?: (nodeId: string, error: Error) => void;
  children: React.ReactNode;
};

type SquashNodeErrorBoundaryState = {
  error: Error | null;
};

class SquashNodeErrorBoundary extends React.Component<
  SquashNodeErrorBoundaryProps,
  SquashNodeErrorBoundaryState
> {
  state: SquashNodeErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): SquashNodeErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    this.props.onRenderError?.(this.props.nodeId, error);
  }

  componentDidUpdate(prevProps: SquashNodeErrorBoundaryProps): void {
    if (
      this.state.error &&
      (prevProps.nodeId !== this.props.nodeId || prevProps.children !== this.props.children)
    ) {
      this.setState({ error: null });
    }
  }

  render(): React.ReactNode {
    if (!this.state.error) {
      return this.props.children;
    }

    return renderInvalidSquashNode(
      this.props.width,
      this.props.height,
      this.props.renderMode,
      this.props.nodeId
    );
  }
}

const renderInvalidSquashNode = (
  width: number,
  height: number,
  renderMode: SquashNodeRenderMode,
  nodeId: string
): React.ReactNode => {
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
};

const SquashNodeContent = React.memo<SquashNodeProps>(function SquashNodeContent({
  node,
  isHovered,
  activePathKey,
  activePathNodeIds,
  onPathHover,
  onPathLeave,
  renderMode = 'export',
  onRenderError: _onRenderError,
}) {
  const [hoveredPlayerIndex, setHoveredPlayerIndex] = useState<number | null>(null);

  useEffect(() => {
    if (renderMode === 'html') {
      ensureSquashNodeAnimations();
    }
  }, [renderMode]);

  const { colors: THEME_COLORS } = useBracketTheme();

  const meta = normalizeMatchMeta(node.meta);
  const [p1, p2] = meta.players ?? DEFAULT_PLAYERS;
  const sets = meta.sets ?? [];
  const tiebreaks = meta.tiebreaks ?? [];
  const status = meta.status ?? 'completed';
  const currentSet = meta.currentSet ?? 0;
  const nodeWidth = node.size?.width ?? NODE_DIMENSIONS.WIDTH;
  const nodeHeight = node.size?.height ?? NODE_DIMENSIONS.HEIGHT;

  // Check if match is TBD (both players or either player is TBD)
  const isTBD = p1.name === 'TBD' || p2.name === 'TBD';
  const normalizedActivePathKey = activePathKey ? normalizePlayerKey(activePathKey) : null;
  const isNodeInActivePath = activePathNodeIds?.has(node.id) ?? false;

  const setWins = sets.reduce(
    (acc, [a, b], index) => {
      // For live matches, exclude the current set from the count
      if (status === 'live' && index === currentSet) {
        return acc;
      }
      if (a > b) acc.p1 += 1;
      else if (b > a) acc.p2 += 1;
      return acc;
    },
    { p1: 0, p2: 0 }
  );

  const winnerIndex = getCompletedWinnerIndex(setWins, status);
  const visibleBorder = `${NODE_BORDER_WIDTH}px solid ${THEME_COLORS.CARD_BORDER}`;

  if (isSvgCompatibleRenderMode(renderMode)) {
    const insetX = 14;
    const rowHeight = nodeHeight / 2;
    const dividerY = rowHeight;
    const badgeSize = 28;
    const scoreSectionWidth = getScoreGroupWidth(Math.max(sets.length, 1));
    const matchCountWidth = 22;
    const internalDividerX = nodeWidth - insetX - matchCountWidth - 10;
    const scoreGroupRightX = internalDividerX - 6;
    const matchCountX = nodeWidth - insetX - matchCountWidth / 2;
    const playerTextX = insetX + badgeSize + 10;
    const maxNameWidth = Math.max(56, internalDividerX - playerTextX - scoreSectionWidth - 10);
    const maxNameLength = Math.max(10, Math.floor(maxNameWidth / 7));
    const filterId = `ds-${node.id.replace(/[^a-z0-9]/gi, '')}`;

    return (
      <g>
        <defs>
          <clipPath id={filterId}>
            <rect width={nodeWidth} height={nodeHeight} rx={16} ry={16} />
          </clipPath>
        </defs>
        <rect
          width={nodeWidth}
          height={nodeHeight}
          rx={16}
          ry={16}
          fill={isHovered ? THEME_COLORS.HOVER_BG : THEME_COLORS.BASE_BG}
          stroke={THEME_COLORS.CARD_BORDER}
          strokeWidth={NODE_BORDER_WIDTH}
        />

        {status === 'live' && (
          <g transform={`translate(${nodeWidth - 18}, 14)`}>
            <circle r={4} fill={THEME_COLORS.LIVE_INDICATOR} />
          </g>
        )}

        <g clipPath={`url(#${filterId})`}>
          {[p1, p2].map((player, idx) => {
            const rowY = idx * rowHeight;
            const scoreSegments = getScoreSegments(sets, tiebreaks, idx);
            const scoreGroupWidth = getScoreGroupWidth(scoreSegments.length);
            const scoreGroupLeftX = scoreGroupRightX - scoreGroupWidth;
            const setCount = idx === 0 ? setWins.p1 : setWins.p2;
            const isWinner = winnerIndex === idx;
            const playerOpacity = status === 'upcoming' ? 0.6 : 1;
            const isPlayerPathMatch =
              isNodeInActivePath &&
              normalizedActivePathKey !== null &&
              normalizePlayerKey(player.name) === normalizedActivePathKey;
            const isPlayerHovered = hoveredPlayerIndex === idx || isPlayerPathMatch;
            const rowFill = isPlayerHovered ? THEME_COLORS.ROW_HOVER_BG : THEME_COLORS.ROW_BG;
            const badgeFill = isWinner ? THEME_COLORS.WINNER_CREST_BG : THEME_COLORS.CREST_BG;
            const badgeTextColor = isWinner
              ? THEME_COLORS.WINNER_CREST_TEXT
              : THEME_COLORS.CREST_TEXT;
            const textColor = isWinner ? THEME_COLORS.FOREGROUND : THEME_COLORS.MUTED_TEXT;
            const badgeText = getPlayerBadgeText(player);

            return (
              <g
                key={`${node.id}-svg-p-${idx}`}
                transform={`translate(0, ${rowY})`}
                opacity={playerOpacity}
                onMouseEnter={() => {
                  setHoveredPlayerIndex(idx);
                  if (!isTBD) {
                    onPathHover?.(idx, { pathKey: player.name });
                  }
                }}
                onMouseLeave={() => {
                  setHoveredPlayerIndex(null);
                  if (!isTBD) {
                    onPathLeave?.();
                  }
                }}
              >
                <rect x={0} width={nodeWidth} height={rowHeight} fill={rowFill} />
                <rect
                  x={insetX}
                  y={(rowHeight - badgeSize) / 2}
                  width={badgeSize}
                  height={badgeSize}
                  rx={7}
                  ry={7}
                  fill={badgeFill}
                />
                <text
                  x={insetX + badgeSize / 2}
                  y={rowHeight / 2 + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={700}
                  fill={badgeTextColor}
                  fontFamily={BODY_FONT_FAMILY}
                >
                  {badgeText}
                </text>
                <text
                  x={playerTextX}
                  y={rowHeight / 2 + 4}
                  fontSize={13}
                  fontWeight={isWinner ? 600 : 500}
                  fill={textColor}
                  fontFamily={BODY_FONT_FAMILY}
                >
                  {truncateText(player.name, maxNameLength)}
                </text>
                <line
                  x1={internalDividerX}
                  y1={rowHeight / 2 - 9}
                  x2={internalDividerX}
                  y2={rowHeight / 2 + 9}
                  stroke={THEME_COLORS.DARK_BORDER}
                  strokeWidth={1}
                />
                {scoreSegments.map((segment, segmentIndex) => {
                  const segmentX =
                    scoreGroupLeftX +
                    SCORE_SEGMENT_WIDTH / 2 +
                    segmentIndex * (SCORE_SEGMENT_WIDTH + SCORE_SEGMENT_GAP);
                  const dividerX = segmentX + SCORE_SEGMENT_WIDTH / 2 + SCORE_SEGMENT_GAP / 2;

                  return (
                    <g key={`${node.id}-svg-score-${idx}-${segmentIndex}`}>
                      <text
                        x={segmentX}
                        y={rowHeight / 2 + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={10.5}
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
                          stroke={THEME_COLORS.BORDER}
                          strokeWidth={1}
                        />
                      ) : null}
                    </g>
                  );
                })}
                <text
                  x={matchCountX}
                  y={rowHeight / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={18}
                  fontWeight={700}
                  fill={textColor}
                  fontFamily={BODY_FONT_FAMILY}
                >
                  {setCount}
                </text>
              </g>
            );
          })}

          <line
            x1={0}
            y1={dividerY}
            x2={nodeWidth}
            y2={dividerY}
            stroke={THEME_COLORS.BORDER}
            strokeWidth={1}
          />
        </g>
      </g>
    );
  }

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
          borderRadius: 16,
          background: isHovered ? THEME_COLORS.HOVER_BG : THEME_COLORS.BASE_BG,
          border: visibleBorder,
          color: THEME_COLORS.FOREGROUND,
          display: 'flex',
          flexDirection: 'column',
          transition: 'background-color 120ms ease, box-shadow 120ms ease',
          transform: 'none',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {status === 'live' && (
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
              color: THEME_COLORS.LIVE_INDICATOR,
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: THEME_COLORS.LIVE_INDICATOR,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
          </div>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateRows: 'repeat(2, 1fr)',
          }}
        >
          {[p1, p2].map((p, idx) => {
            const badgeText = getPlayerBadgeText(p);
            const scoreSegments = getScoreSegments(sets, tiebreaks, idx);
            const scoreGroupWidth = getScoreGroupWidth(Math.max(sets.length, 1));
            const setCount = idx === 0 ? setWins.p1 : setWins.p2;
            const isWinner = winnerIndex === idx;
            const playerOpacity = status === 'upcoming' ? 0.6 : 1;
            const isPlayerPathMatch =
              isNodeInActivePath &&
              normalizedActivePathKey !== null &&
              normalizePlayerKey(p.name) === normalizedActivePathKey;
            const isPlayerHovered = hoveredPlayerIndex === idx || isPlayerPathMatch;
            const rowBackground = isPlayerHovered ? THEME_COLORS.ROW_HOVER_BG : THEME_COLORS.ROW_BG;
            const rowTextColor = isWinner ? THEME_COLORS.FOREGROUND : THEME_COLORS.MUTED_TEXT;
            const badgeBackground = isWinner ? THEME_COLORS.WINNER_CREST_BG : THEME_COLORS.CREST_BG;
            const badgeColor = isWinner ? THEME_COLORS.WINNER_CREST_TEXT : THEME_COLORS.CREST_TEXT;

            return (
              <div
                key={`${node.id}-p-${idx}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `28px minmax(0, 1fr) ${scoreGroupWidth}px 24px`,
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 12px',
                  minHeight: nodeHeight / 2,
                  background: rowBackground,
                  opacity: playerOpacity,
                  transition: 'background-color 140ms ease',
                  borderTop: idx === 1 ? `1px solid ${THEME_COLORS.BORDER}` : 'none',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={() => {
                  setHoveredPlayerIndex(idx);
                  if (!isTBD) {
                    onPathHover?.(idx, { pathKey: p.name });
                  }
                }}
                onMouseLeave={() => {
                  setHoveredPlayerIndex(null);
                  if (!isTBD) {
                    onPathLeave?.();
                  }
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: badgeBackground,
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    color: badgeColor,
                    fontSize: 12,
                    flexShrink: 0,
                    fontFamily: BODY_FONT_FAMILY,
                  }}
                  aria-label={`crest-${p.name}`}
                >
                  {badgeText}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isWinner ? 600 : 500,
                      color: rowTextColor,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontFamily: BODY_FONT_FAMILY,
                    }}
                  >
                    {p.name}
                  </span>
                </div>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    minWidth: 0,
                    width: '100%',
                    gap: SCORE_SEGMENT_GAP,
                  }}
                >
                  {scoreSegments.map((segment, segmentIndex) => (
                    <React.Fragment key={`${node.id}-html-score-${idx}-${segmentIndex}`}>
                      <span
                        style={{
                          width: SCORE_SEGMENT_WIDTH,
                          fontSize: 10.5,
                          color: rowTextColor,
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
                            background: THEME_COLORS.BORDER,
                            flexShrink: 0,
                          }}
                        />
                      ) : null}
                    </React.Fragment>
                  ))}
                </span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 20,
                    borderLeft: `1px solid ${THEME_COLORS.DARK_BORDER}`,
                    fontSize: 18,
                    fontWeight: 700,
                    color: rowTextColor,
                    fontFamily: BODY_FONT_FAMILY,
                    paddingLeft: 8,
                  }}
                >
                  {setCount}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </foreignObject>
  );
});

export const SquashNode = React.memo<SquashNodeProps>(function SquashNode({
  node,
  renderMode = 'export',
  onRenderError,
  ...props
}) {
  const width = node.size?.width ?? NODE_DIMENSIONS.WIDTH;
  const height = node.size?.height ?? NODE_DIMENSIONS.HEIGHT;

  return (
    <SquashNodeErrorBoundary
      nodeId={node.id}
      renderMode={renderMode}
      width={width}
      height={height}
      onRenderError={onRenderError}
    >
      <SquashNodeContent {...props} node={node} renderMode={renderMode} />
    </SquashNodeErrorBoundary>
  );
});

SquashNode.displayName = 'SquashNode';
