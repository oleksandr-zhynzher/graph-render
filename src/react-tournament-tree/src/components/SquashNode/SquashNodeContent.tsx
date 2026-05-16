import React, { useEffect, useState } from 'react';
import { NODE_DIMENSIONS, NODE_DIMENSIONS_COMPACT } from '../../constants';
import { useBracketTheme } from '../../contexts/BracketThemeContext';
import {
  getCompletedWinnerIndex,
  getSetWins,
  normalizeMatchMeta,
  normalizePlayerKey,
} from '../../utils/squash';
import { ensureSquashNodeAnimations } from './animations';
import { isSvgCompatibleRenderMode } from './renderMode';
import { SquashNodeHtml } from './SquashNodeHtml';
import { SquashNodeSvg } from './SquashNodeSvg';
import type { SquashNodeProps } from './types';

export const SquashNodeContent = React.memo<SquashNodeProps>(function SquashNodeContent({
  node,
  isHovered,
  activePathKey,
  activePathNodeIds,
  onPathHover,
  onPathLeave,
  renderMode = 'export',
  compact = true,
}) {
  const [hoveredPlayerIndex, setHoveredPlayerIndex] = useState<number | null>(null);
  const { colors } = useBracketTheme();

  useEffect(() => {
    if (renderMode === 'html') {
      ensureSquashNodeAnimations();
    }
  }, [renderMode]);

  const meta = normalizeMatchMeta(node.meta);
  const [p1, p2] = meta.players;
  const nodeWidth =
    node.size?.width ?? (compact ? NODE_DIMENSIONS_COMPACT.WIDTH : NODE_DIMENSIONS.WIDTH);
  const nodeHeight =
    node.size?.height ?? (compact ? NODE_DIMENSIONS_COMPACT.HEIGHT : NODE_DIMENSIONS.HEIGHT);
  const setWins = getSetWins(meta.sets, meta.status, meta.currentSet);
  const sharedProps = {
    nodeId: node.id,
    nodeWidth,
    nodeHeight,
    compact,
    isHovered,
    hoveredPlayerIndex,
    normalizedActivePathKey: activePathKey ? normalizePlayerKey(activePathKey) : null,
    isNodeInActivePath: activePathNodeIds?.has(node.id) ?? false,
    isTBD: p1.name === 'TBD' || p2.name === 'TBD',
    meta,
    setWins,
    winnerIndex: getCompletedWinnerIndex(setWins, meta.status),
    colors,
    onPlayerEnter: (playerIndex: number, player: (typeof meta.players)[number]) => {
      setHoveredPlayerIndex(playerIndex);
      if (p1.name !== 'TBD' && p2.name !== 'TBD') {
        onPathHover?.(playerIndex, { pathKey: player.name });
      }
    },
    onPlayerLeave: () => {
      setHoveredPlayerIndex(null);
      if (p1.name !== 'TBD' && p2.name !== 'TBD') {
        onPathLeave?.();
      }
    },
  };

  if (isSvgCompatibleRenderMode(renderMode)) {
    return <SquashNodeSvg {...sharedProps} />;
  }

  return <SquashNodeHtml {...sharedProps} />;
});
