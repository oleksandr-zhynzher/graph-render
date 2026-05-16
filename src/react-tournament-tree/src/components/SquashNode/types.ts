import type { SquashNodeRenderMode, SquashPlayer, VertexComponentProps } from '@graph-render/types';
import type { THEME_COLORS_DARK, THEME_COLORS_LIGHT } from '../../constants';
import type { NormalizedSquashMatchMeta, SetWins } from '../../utils/squash';

export interface SquashNodeProps extends VertexComponentProps {
  renderMode?: SquashNodeRenderMode;
  compact?: boolean;
  onRenderError?: (nodeId: string, error: Error) => void;
}

export type SquashThemeColors = typeof THEME_COLORS_LIGHT | typeof THEME_COLORS_DARK;

export type PlayerHoverHandlers = {
  onPlayerEnter: (playerIndex: number, player: SquashPlayer) => void;
  onPlayerLeave: () => void;
};

export type SquashNodeVariantProps = PlayerHoverHandlers & {
  nodeId: string;
  nodeWidth: number;
  nodeHeight: number;
  compact: boolean;
  isHovered?: boolean;
  hoveredPlayerIndex: number | null;
  normalizedActivePathKey: string | null;
  isNodeInActivePath: boolean;
  isTBD: boolean;
  meta: NormalizedSquashMatchMeta;
  setWins: SetWins;
  winnerIndex: number | null;
  colors: SquashThemeColors;
};

export type SquashPlayerRowProps = PlayerHoverHandlers & {
  nodeId: string;
  player: SquashPlayer;
  playerIndex: number;
  compact: boolean;
  isTBD: boolean;
  isWinner: boolean;
  isPlayerHovered: boolean;
  playerOpacity: number;
  setCount: number;
  scoreSegments: string[];
  textColor: string;
  colors: SquashThemeColors;
};
