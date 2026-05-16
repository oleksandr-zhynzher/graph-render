import type { SquashPlayer } from '@graph-render/types';

import { DEFAULT_PLAYERS } from './node';

export const SCORE_FONT_FAMILY = '"Space Mono", "SFMono-Regular", ui-monospace, monospace';
export const BODY_FONT_FAMILY = '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif';
export const SCORE_SEGMENT_WIDTH = 16;
export const SCORE_SEGMENT_GAP = 5;
export const SCORE_SEPARATOR_HEIGHT = 10;
export const NODE_BORDER_WIDTH = 2;

export const DEFAULT_PLAYER_ONE: SquashPlayer = DEFAULT_PLAYERS[0] ?? { name: 'TBD', seed: 0 };
export const DEFAULT_PLAYER_TWO: SquashPlayer = DEFAULT_PLAYERS[1] ?? { name: 'TBD', seed: 0 };
