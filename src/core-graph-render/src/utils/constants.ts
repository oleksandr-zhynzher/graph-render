import type { GraphTheme, Size } from '@graph-render/types';

export const DEFAULT_NODE_GAP = 96;
export const DEFAULT_PADDING = 24;
export const DEFAULT_NODE_SIZE: Size = { width: 180, height: 72 };

export const DEFAULT_THEME: Required<
  Pick<GraphTheme, 'background' | 'edgeColor' | 'edgeWidth' | 'fontFamily'>
> & { readonly nodeGap: number } = {
  background: '#0c0c10',
  edgeColor: '#8b9dbf',
  edgeWidth: 2,
  nodeGap: 96,
  fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
};

// Default rendering constants
export const DEFAULT_NODE_WIDTH = 180;
export const DEFAULT_NODE_HEIGHT = 72;
export const DEFAULT_NODE_RADIUS = 8;
export const DEFAULT_NODE_FILL = 'white';
export const DEFAULT_NODE_STROKE = '#d7dbe3';
export const DEFAULT_TEXT_FILL = '#111827';
export const DEFAULT_TEXT_SIZE = 14;

// Graph dimensions
export const DEFAULT_WIDTH = 960;
export const DEFAULT_HEIGHT = 720;
export const MAX_DIMENSION = 32_768;

// Config defaults
export const DEFAULT_CURVE_STRENGTH = 0.3;
export const DEFAULT_ARROW_PADDING = 6;
export const DEFAULT_EDGE_SEPARATION = 18;
export const DEFAULT_SELF_LOOP_RADIUS = 32;
export const DEFAULT_LABEL_OFFSET = 32;

// Label measurement defaults
export const DEFAULT_LABEL_PADDING_X = 18;
export const DEFAULT_LABEL_PADDING_Y = 12;
export const DEFAULT_LABEL_CHAR_WIDTH = 8;
export const DEFAULT_LABEL_LINE_HEIGHT = 18;

// Hover colors
export const DEFAULT_HOVER_EDGE_COLOR = '#4da3ff';
export const DEFAULT_HOVER_NODE_IN_COLOR = '#2ecc71';
export const DEFAULT_HOVER_NODE_OUT_COLOR = '#ff5b5b';

// Edge / label pill colors
export const DEFAULT_EDGE_LABEL_COLOR = '#334155';
export const DEFAULT_LABEL_PILL_BACKGROUND = '#eef1f6';
export const DEFAULT_LABEL_PILL_BORDER_COLOR = '#d7dbe3';
export const DEFAULT_LABEL_PILL_TEXT_COLOR = '#3f434b';

// CSS validation patterns (shared between config and rendering)
export const CSS_COLOR_PATTERN =
  /^(#[\dA-Fa-f]{3,8}|(?:rgb|hsl)a?\([\d\s%+,.-]+\)|[A-Za-z][\dA-Za-z-]*|var\(--[\w-]+\))$/;
export const FONT_FAMILY_PATTERN = /^[\d\s"',a-z-]+$/i;

// Rendering limits
export const MAX_RENDER_LABEL_LENGTH = 2000;
export const MAX_RENDER_LABEL_LINES = 8;

// Node sizing limits
export const MAX_MEASUREMENT_TEXT_LENGTH = 4000;
export const MAX_MEASUREMENT_LINES = 200;
export const MAX_MEASUREMENT_CHARS_PER_LINE = 400;

// Edge routing
export const MAX_COLLISION_SCAN_WORK = 20_000;
export const ORTHOGONAL_TERMINAL_SEGMENT = 20;

// Force layout
export const FORCE_LAYOUT_CACHE_LIMIT = 24;
export const MAX_SYNC_FORCE_NODES = 250;

// Orthogonal flow layout
export const VERTICAL_GAP_RATIO = 0.45;
export const VERTICAL_GAP_MIN = 20;
export const VERTICAL_GAP_HEIGHT_RATIO = 0.3;
