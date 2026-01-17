import React from 'react';
import type { VertexComponentProps } from '@graph-render/types';
import type { SquashMatchMeta } from '../types';
import { NODE_DIMENSIONS, DEFAULT_PLAYERS } from '../constants';
import { useBracketTheme } from '../contexts/BracketThemeContext';

// Add keyframes for pulse animation
const styleTag = document.createElement('style');
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
if (!document.querySelector('style[data-squash-node-animations]')) {
  styleTag.setAttribute('data-squash-node-animations', 'true');
  document.head.appendChild(styleTag);
}

export const SquashNode = React.memo<VertexComponentProps>(function SquashNode({
  node,
  isHovered,
  onPathHover,
  onPathLeave,
}) {
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
                onMouseEnter={() => !isTBD && onPathHover?.(idx, { playerKey: p.name })}
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
