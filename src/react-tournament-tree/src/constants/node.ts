import type { SquashPlayer } from '../types/squash';

export const NODE_DIMENSIONS = {
  WIDTH: 220,
  HEIGHT: 90,
} as const;

export const THEME_COLORS_LIGHT = {
  /** Card background — clean white so cards pop against the page. */
  BASE_BG: '#ffffff',
  HOVER_BG: '#edf5ff',
  CREST_BG: '#e8eef7',
  /** Default player-row background. */
  ROW_BG: '#f8fafc',
  /** Winner player-row background — subtle green tint. */
  ROW_BG_WINNER: '#f0fdf4',
  FOREGROUND: '#1e293b',
  DARK_TEXT: '#0f172a',
  BORDER: '#e2e8f0',
  DARK_BORDER: '#cbd5e1',
  /** Card outline stroke. */
  CARD_BORDER: '#dee3ed',
  /** Left-accent bar and set-count highlight for the winning player. */
  WINNER_ACCENT: '#16a34a',
  WINNING_SCORE: '#16a34a',
  LIVE_WINNING_SCORE: '#2563eb',
  LIVE_INDICATOR: '#3b82f6',
  UPCOMING_TEXT: '#94a3b8',
} as const;

export const THEME_COLORS_DARK = {
  BASE_BG: '#1e2a3a',
  HOVER_BG: '#253347',
  CREST_BG: '#162032',
  ROW_BG: '#192534',
  ROW_BG_WINNER: '#0f2a1a',
  FOREGROUND: '#f1f5f9',
  DARK_TEXT: '#e2e8f0',
  BORDER: '#2d3d52',
  DARK_BORDER: '#3d5068',
  CARD_BORDER: '#2a3d52',
  WINNER_ACCENT: '#22c55e',
  WINNING_SCORE: '#34d399',
  LIVE_WINNING_SCORE: '#60a5fa',
  LIVE_INDICATOR: '#3b82f6',
  UPCOMING_TEXT: '#64748b',
} as const;

// Default to light theme
export const THEME_COLORS = THEME_COLORS_LIGHT;

export const DEFAULT_PLAYERS: SquashPlayer[] = [
  { name: 'TBD', seed: 0 },
  { name: 'TBD', seed: 0 },
];
