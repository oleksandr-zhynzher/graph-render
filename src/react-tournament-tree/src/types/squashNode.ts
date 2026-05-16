import type { SquashNodeRenderMode, SquashPlayer, VertexComponentProps } from '@graph-render/types';

import type { THEME_COLORS_DARK, THEME_COLORS_LIGHT } from '../constants';
import type { NormalizedSquashMatchMeta, SetWins } from '../utils/squash';

export interface SquashNodeProps extends VertexComponentProps {
  readonly renderMode?: SquashNodeRenderMode | undefined;
  readonly compact?: boolean | undefined;
  readonly onRenderError?: ((nodeId: string, error: Error) => void) | undefined;
}

export type SquashThemeColors = typeof THEME_COLORS_LIGHT | typeof THEME_COLORS_DARK;

export interface PlayerHoverHandlers {
  readonly onPlayerEnter: (playerIndex: number, player: SquashPlayer) => void;
  readonly onPlayerLeave: () => void;
}

export type SquashNodeVariantProps = PlayerHoverHandlers & {
  readonly nodeId: string;
  readonly nodeWidth: number;
  readonly nodeHeight: number;
  readonly compact: boolean;
  readonly isHovered?: boolean | undefined;
  readonly hoveredPlayerIndex: number | null;
  readonly normalizedActivePathKey: string | null;
  readonly isNodeInActivePath: boolean;
  readonly isTBD: boolean;
  readonly meta: NormalizedSquashMatchMeta;
  readonly setWins: SetWins;
  readonly winnerIndex: number | null;
  readonly colors: SquashThemeColors;
};

export type SquashPlayerRowProps = PlayerHoverHandlers & {
  readonly nodeId: string;
  readonly player: SquashPlayer;
  readonly playerIndex: number;
  readonly compact: boolean;
  readonly isTBD: boolean;
  readonly isWinner: boolean;
  readonly isPlayerHovered: boolean;
  readonly playerOpacity: number;
  readonly setCount: number;
  readonly scoreSegments: readonly string[];
  readonly textColor: string;
  readonly colors: SquashThemeColors;
};
