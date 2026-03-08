import React, { useEffect } from 'react';
import type { VertexComponentProps } from '@graph-render/types';
import type { SquashMatchMeta, SquashNodeRenderMode } from '../types';
import { NODE_DIMENSIONS, DEFAULT_PLAYERS } from '../constants';
import { useBracketTheme } from '../contexts/BracketThemeContext';

interface SquashNodeProps extends VertexComponentProps {
  renderMode?: SquashNodeRenderMode;
}

const truncateText = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
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
  renderMode = 'svg',
}) {
  useEffect(() => {
    if (renderMode === 'html') {
      ensureSquashNodeAnimations();
    }
  }, [renderMode]);

  const { colors: THEME_COLORS } = useBracketTheme();

  const meta = (node.meta as SquashMatchMeta | undefined) ?? {
    stage: 'Stage',
    players: DEFAULT_PLAYERS,
  };
  const [p1, p2] = meta.players ?? DEFAULT_PLAYERS;
  const sets = meta.sets ?? [];
  const tiebreaks = meta.tiebreaks ?? [];
  const status = meta.status ?? 'completed';
  const currentSet = meta.currentSet ?? 0;

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

  if (renderMode === 'svg') {
    const rowHeight = 30;
    const rowYStart = 24;
    const scoreStartX = 148;
    const scoreCellWidth = 16;

    return (
      <g>
        <rect
          width={NODE_DIMENSIONS.WIDTH}
          height={NODE_DIMENSIONS.HEIGHT}
          rx={12}
          ry={12}
          fill={isHovered ? THEME_COLORS.HOVER_BG : THEME_COLORS.BASE_BG}
        />

        {status === 'live' && (
          <g transform={`translate(${NODE_DIMENSIONS.WIDTH - 22}, 11)`}>
            <circle r={4} fill={THEME_COLORS.LIVE_INDICATOR} />
          </g>
        )}

        {[p1, p2].map((player, idx) => {
          const rowY = rowYStart + idx * (rowHeight + 6);
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
              transform={`translate(8, ${rowY})`}
              opacity={playerOpacity}
              onMouseEnter={() => !isTBD && onPathHover?.(idx, { pathKey: player.name })}
              onMouseLeave={() => !isTBD && onPathLeave?.()}
            >
              <rect
                width={NODE_DIMENSIONS.WIDTH - 16}
                height={rowHeight}
                rx={10}
                ry={10}
                fill={THEME_COLORS.ROW_BG}
              />
              <rect x={4} y={2} width={26} height={26} rx={8} ry={8} fill={THEME_COLORS.CREST_BG} />
              <text
                x={17}
                y={20}
                textAnchor="middle"
                fontSize={10}
                fontWeight={800}
                fill={THEME_COLORS.FOREGROUND}
              >
                {initials}
              </text>
              <text x={38} y={19} fontSize={13} fontWeight={700} fill={THEME_COLORS.FOREGROUND}>
                {truncateText(player.name, 14)}
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
                const scoreX = scoreStartX + setIndex * scoreCellWidth;

                return (
                  <g key={`${node.id}-svg-p-${idx}-set-${setIndex}`}>
                    {setIndex > 0 && (
                      <line
                        x1={scoreX - 3}
                        y1={6}
                        x2={scoreX - 3}
                        y2={24}
                        stroke={THEME_COLORS.BORDER}
                        strokeWidth={1}
                      />
                    )}
                    <text
                      x={scoreX}
                      y={16}
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
                        y={25}
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
                x1={scoreStartX + 3 * scoreCellWidth + 5}
                y1={6}
                x2={scoreStartX + 3 * scoreCellWidth + 5}
                y2={24}
                stroke={THEME_COLORS.DARK_BORDER}
                strokeWidth={1}
              />
              <text
                x={scoreStartX + 3 * scoreCellWidth + 16}
                y={16}
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
      width={NODE_DIMENSIONS.WIDTH}
      height={NODE_DIMENSIONS.HEIGHT}
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
