import React, { useEffect } from 'react';
import type { VertexComponentProps } from '@graph-render/types';
import type {
  MatchStatus,
  SquashMatchMeta,
  SquashNodeRenderMode,
  SquashPlayer,
} from '../types';
import { NODE_DIMENSIONS, DEFAULT_PLAYERS } from '../constants';
import { useBracketTheme } from '../contexts/BracketThemeContext';

interface SquashNodeProps extends VertexComponentProps {
  renderMode?: SquashNodeRenderMode;
}

const isSvgCompatibleRenderMode = (renderMode: SquashNodeRenderMode): boolean => {
  return renderMode === 'svg' || renderMode === 'export' || renderMode === 'server';
};

const truncateText = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
};

const isMatchStatus = (value: unknown): value is MatchStatus => {
  return value === 'completed' || value === 'live' || value === 'upcoming';
};

const normalizePlayer = (value: unknown, fallback: SquashPlayer): SquashPlayer => {
  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const player = value as Partial<SquashPlayer>;
  return {
    name: typeof player.name === 'string' && player.name.trim() ? player.name.trim() : fallback.name,
    seed: typeof player.seed === 'number' && Number.isFinite(player.seed) ? player.seed : undefined,
    country: typeof player.country === 'string' && player.country.trim() ? player.country.trim() : undefined,
  };
};

const normalizeSets = (value: unknown): number[][] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(0, 3)
    .map((entry) => {
      if (!Array.isArray(entry)) {
        return [];
      }

      return entry
        .slice(0, 2)
        .map((score) => (typeof score === 'number' && Number.isFinite(score) ? score : 0));
    })
    .filter((entry) => entry.length === 2);
};

const normalizeTiebreaks = (value: unknown): (number[] | null)[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.slice(0, 3).map((entry) => {
    if (!Array.isArray(entry)) {
      return null;
    }

    const scores = entry
      .slice(0, 2)
      .map((score) => (typeof score === 'number' && Number.isFinite(score) ? score : 0));

    return scores.length === 2 ? scores : null;
  });
};

const normalizeMatchMeta = (meta: unknown): Required<SquashMatchMeta> => {
  const rawMeta = meta && typeof meta === 'object' ? (meta as Partial<SquashMatchMeta>) : undefined;
  const players = Array.isArray(rawMeta?.players) ? rawMeta.players : [];
  const normalizedPlayers = [
    normalizePlayer(players[0], DEFAULT_PLAYERS[0]),
    normalizePlayer(players[1], DEFAULT_PLAYERS[1]),
  ];
  const sets = normalizeSets(rawMeta?.sets);

  return {
    stage:
      typeof rawMeta?.stage === 'string' && rawMeta.stage.trim() ? rawMeta.stage.trim() : 'Stage',
    players: normalizedPlayers,
    sets,
    tiebreaks: normalizeTiebreaks(rawMeta?.tiebreaks),
    status: isMatchStatus(rawMeta?.status) ? rawMeta.status : 'completed',
    currentSet:
      typeof rawMeta?.currentSet === 'number' && Number.isFinite(rawMeta.currentSet)
        ? Math.max(0, Math.min(Math.floor(rawMeta.currentSet), Math.max(sets.length - 1, 0)))
        : 0,
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

export const SquashNode = React.memo<SquashNodeProps>(function SquashNode({
  node,
  isHovered,
  onPathHover,
  onPathLeave,
  renderMode = 'export',
}) {
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

  if (isSvgCompatibleRenderMode(renderMode)) {
    const rowInsetX = 8;
    const rowInsetY = rowInsetX;
    const rowGap = 6;
    const rowHeight = Math.max(30, (nodeHeight - rowInsetY * 2 - rowGap) / 2);
    const rowYStart = rowInsetY;
    const rowWidth = nodeWidth - rowInsetX * 2;
    const crestSize = 26;
    const crestX = 4;
    const crestY = Math.max(2, (rowHeight - crestSize) / 2);
    const crestCenterX = crestX + crestSize / 2;
    const crestCenterY = crestY + crestSize / 2;
    const playerTextY = Math.max(19, rowHeight / 2 + 5);
    const scoreTextY = Math.max(16, rowHeight / 2 + 2);
    const tiebreakTextY = rowHeight - 5;
    const dividerTopY = 6;
    const dividerBottomY = rowHeight - 6;
    const scoreColumns = 3;
    const scoreColumnGap = 22;
    const setCountCenterX = rowWidth - 12;
    const setCountDividerX = rowWidth - 26;
    const lastScoreCenterX = setCountDividerX - 12;
    const scoreStartX = lastScoreCenterX - scoreColumnGap * (scoreColumns - 1);
    const scoreCenters = Array.from({ length: scoreColumns }, (_, index) => {
      return scoreStartX + scoreColumnGap * index;
    });
    const scoreDividers = scoreCenters.slice(1).map((centerX, index) => {
      return (scoreCenters[index] + centerX) / 2;
    });
    const playerNameX = 38;
    const maxNameWidth = Math.max(48, scoreStartX - playerNameX - 16);
    const maxNameLength = Math.max(8, Math.floor(maxNameWidth / 7));

    return (
      <g>
        <rect
          width={nodeWidth}
          height={nodeHeight}
          rx={12}
          ry={12}
          fill={isHovered ? THEME_COLORS.HOVER_BG : THEME_COLORS.BASE_BG}
        />

        {status === 'live' && (
          <g transform={`translate(${nodeWidth - 22}, 11)`}>
            <circle r={4} fill={THEME_COLORS.LIVE_INDICATOR} />
          </g>
        )}

        {[p1, p2].map((player, idx) => {
          const rowY = rowYStart + idx * (rowHeight + rowGap);
          const initials = player.name ? player.name.substring(0, 2).toUpperCase() : '??';
          const perSet = [0, 0, 0].map((_, setIndex) => {
            const value = sets[setIndex]?.[idx === 0 ? 0 : 1];
            return Number.isFinite(value) ? value : '—';
          });
          const setCount = idx === 0 ? setWins.p1 : setWins.p2;
          const playerOpacity = status === 'upcoming' ? 0.65 : 1;

          return (
            <g
              key={`${node.id}-svg-p-${idx}`}
              transform={`translate(${rowInsetX}, ${rowY})`}
              opacity={playerOpacity}
              onMouseEnter={() => !isTBD && onPathHover?.(idx, { pathKey: player.name })}
              onMouseLeave={() => !isTBD && onPathLeave?.()}
            >
              <rect
                width={rowWidth}
                height={rowHeight}
                rx={10}
                ry={10}
                fill={THEME_COLORS.ROW_BG}
              />
              <rect
                x={crestX}
                y={crestY}
                width={crestSize}
                height={crestSize}
                rx={8}
                ry={8}
                fill={THEME_COLORS.CREST_BG}
              />
              <text
                x={crestCenterX}
                y={crestCenterY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fontWeight={800}
                fill={THEME_COLORS.FOREGROUND}
              >
                {initials}
              </text>
              <text
                x={playerNameX}
                y={playerTextY}
                fontSize={13}
                fontWeight={700}
                fill={THEME_COLORS.FOREGROUND}
              >
                {truncateText(player.name, maxNameLength)}
              </text>

              {perSet.map((value, setIndex) => {
                const opponentValue = sets[setIndex]?.[idx === 0 ? 1 : 0];
                const wonSet =
                  typeof value === 'number' &&
                  typeof opponentValue === 'number' &&
                  value > opponentValue;
                const isCurrentSet = status === 'live' && setIndex === currentSet;
                const shouldHighlight = wonSet && !(status === 'live' && isCurrentSet);
                const tiebreak = tiebreaks[setIndex];
                const hasTiebreak = tiebreak && tiebreak.length === 2;
                const scoreX = scoreCenters[setIndex] ?? scoreStartX;
                const dividerX = scoreDividers[setIndex - 1];

                return (
                  <g key={`${node.id}-svg-p-${idx}-set-${setIndex}`}>
                    {setIndex > 0 && dividerX != null && (
                      <line
                        x1={dividerX}
                        y1={dividerTopY}
                        x2={dividerX}
                        y2={dividerBottomY}
                        stroke={THEME_COLORS.BORDER}
                        strokeWidth={1}
                      />
                    )}
                    <text
                      x={scoreX}
                      y={scoreTextY}
                      textAnchor="middle"
                      fontSize={13}
                      fontWeight={shouldHighlight ? 700 : 400}
                      fill={shouldHighlight ? THEME_COLORS.WINNING_SCORE : THEME_COLORS.FOREGROUND}
                    >
                      {value}
                    </text>
                    {hasTiebreak && (
                      <text
                        x={scoreX}
                        y={tiebreakTextY}
                        textAnchor="middle"
                        fontSize={8}
                        fill={THEME_COLORS.DARK_TEXT}
                      >
                        {tiebreak[idx]}
                      </text>
                    )}
                  </g>
                );
              })}

              <line
                x1={setCountDividerX}
                y1={dividerTopY}
                x2={setCountDividerX}
                y2={dividerBottomY}
                stroke={THEME_COLORS.DARK_BORDER}
                strokeWidth={1}
              />
              <text
                x={setCountCenterX}
                y={scoreTextY}
                textAnchor="middle"
                fontSize={13}
                fontWeight={status === 'completed' ? 900 : 400}
                fill={THEME_COLORS.DARK_TEXT}
              >
                {setCount}
              </text>
            </g>
          );
        })}
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
          padding: '6px 8px',
          borderRadius: 12,
          background: isHovered ? THEME_COLORS.HOVER_BG : THEME_COLORS.BASE_BG,
          border: 'none',
          color: THEME_COLORS.FOREGROUND,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          boxShadow: isHovered ? '0 6px 20px rgba(0,0,0,0.12)' : '0 2px 10px rgba(0,0,0,0.05)',
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
              top: 4,
              right: 8,
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
            gap: 4,
          }}
        >
          {[p1, p2].map((p, idx) => {
            const initials = p.name ? p.name.substring(0, 2).toUpperCase() : '??';
            const perSet = [0, 0, 0].map((_, sIdx) => {
              const val = sets[sIdx]?.[idx === 0 ? 0 : 1];
              return Number.isFinite(val) ? val : '—';
            });
            const setCount = idx === 0 ? setWins.p1 : setWins.p2;
            const playerOpacity = status === 'upcoming' ? 0.6 : 1;

            return (
              <div
                key={`${node.id}-p-${idx}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr repeat(3, 26px)',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 6px',
                  borderRadius: 10,
                  background: THEME_COLORS.ROW_BG,
                  opacity: playerOpacity,
                }}
                onMouseEnter={() => !isTBD && onPathHover?.(idx, { pathKey: p.name })}
                onMouseLeave={() => !isTBD && onPathLeave?.()}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: THEME_COLORS.CREST_BG,
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    color: THEME_COLORS.FOREGROUND,
                    fontSize: 10,
                  }}
                  aria-label={`crest-${p.name}`}
                >
                  {initials}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: THEME_COLORS.FOREGROUND,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.name}
                  </span>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 2,
                    maxWidth: 80,
                    width: '100%',
                  }}
                >
                  {perSet.map((val, sIdx) => {
                    // Check if this player won this set
                    const opponentVal = sets[sIdx]?.[idx === 0 ? 1 : 0];
                    const wonSet =
                      typeof val === 'number' &&
                      typeof opponentVal === 'number' &&
                      val > opponentVal;
                    const isCurrentSet = status === 'live' && sIdx === currentSet;
                    const tiebreak = tiebreaks[sIdx];
                    const hasTiebreak = tiebreak && tiebreak.length === 2;

                    const shouldHighlight = wonSet && !(status === 'live' && isCurrentSet);
                    const scoreColor = shouldHighlight
                      ? THEME_COLORS.WINNING_SCORE
                      : THEME_COLORS.FOREGROUND;

                    return (
                      <div
                        key={`${node.id}-p-${idx}-set-${sIdx}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          minWidth: 20,
                          maxWidth: 20,
                          borderLeft: sIdx === 0 ? 'none' : `1px solid ${THEME_COLORS.BORDER}`,
                          paddingLeft: sIdx === 0 ? 0 : 2,
                        }}
                      >
                        <span
                          style={{
                            textAlign: 'center',
                            fontWeight: shouldHighlight ? 700 : 400,
                            fontSize: 14,
                            color: scoreColor,
                          }}
                        >
                          {val}
                        </span>
                        {hasTiebreak && (
                          <span
                            style={{
                              textAlign: 'center',
                              fontWeight: 400,
                              fontSize: 9,
                              color: THEME_COLORS.DARK_TEXT,
                              marginTop: -2,
                            }}
                          >
                            {tiebreak[idx]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <span
                    style={{
                      textAlign: 'center',
                      fontWeight: status === 'completed' ? 900 : 400,
                      fontSize: 14,
                      color: THEME_COLORS.DARK_TEXT,
                      minWidth: 20,
                      maxWidth: 20,
                      borderLeft: `1px solid ${THEME_COLORS.DARK_BORDER}`,

                      paddingLeft: 3,
                    }}
                  >
                    {setCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </foreignObject>
  );
});

SquashNode.displayName = 'SquashNode';
