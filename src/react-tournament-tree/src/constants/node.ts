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
  /** Winner player-row background — neutral tint to avoid green blocks. */
  ROW_BG_WINNER: '#f3f6fb',
  ROW_HOVER_BG: '#dbeafe',
  FOREGROUND: '#1e293b',
  DARK_TEXT: '#0f172a',
  BORDER: '#e2e8f0',
  DARK_BORDER: '#cbd5e1',
  /** Card outline stroke. */
  CARD_BORDER: '#dee3ed',
  /** Left-accent bar and winner emphasis use neutral ink instead of green. */
  WINNER_ACCENT: '#334155',
  WINNING_SCORE: '#0f172a',
  LIVE_WINNING_SCORE: '#2563eb',
  LIVE_INDICATOR: '#3b82f6',
  UPCOMING_TEXT: '#94a3b8',
} as const;

export const THEME_COLORS_DARK = {
  BASE_BG: '#1e2a3a',
  HOVER_BG: '#253347',
  CREST_BG: '#162032',
  ROW_BG: '#192534',
  ROW_BG_WINNER: '#1c2938',
  ROW_HOVER_BG: '#2b425c',
  FOREGROUND: '#f1f5f9',
  DARK_TEXT: '#e2e8f0',
  BORDER: '#2d3d52',
  DARK_BORDER: '#3d5068',
  CARD_BORDER: '#2a3d52',
  WINNER_ACCENT: '#cbd5e1',
  WINNING_SCORE: '#f8fafc',
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
