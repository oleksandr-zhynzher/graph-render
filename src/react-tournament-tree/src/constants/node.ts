import type { SquashPlayer } from '../types/squash';

export const NODE_DIMENSIONS = {
  WIDTH: 220,
  HEIGHT: 90,
} as const;

export const THEME_COLORS_LIGHT = {
  BASE_BG: '#eaf2ff',
  HOVER_BG: '#cfdfff',
  CREST_BG: '#d9e5f7',
  ROW_BG: '#eef3fb',
  FOREGROUND: '#0f1728',
  DARK_TEXT: '#0b1a3a',
  BORDER: '#e1e5ed',
  DARK_BORDER: '#d6dbe5',
  WINNING_SCORE: '#059669',
  LIVE_WINNING_SCORE: '#2563eb',
  LIVE_INDICATOR: '#3b82f6',
  UPCOMING_TEXT: '#94a3b8',
} as const;

export const THEME_COLORS_DARK = {
  BASE_BG: '#334155',
  HOVER_BG: '#475569',
  CREST_BG: '#1e293b',
  ROW_BG: '#1e293b',
  FOREGROUND: '#f1f5f9',
  DARK_TEXT: '#e2e8f0',
  BORDER: '#64748b',
  DARK_BORDER: '#94a3b8',
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
