import { Size, GraphTheme } from '@graph-render/types';

export const DEFAULT_NODE_GAP = 96;
export const DEFAULT_PADDING = 24;
export const DEFAULT_NODE_SIZE: Size = { width: 180, height: 72 };

export const DEFAULT_THEME: Required<
  Pick<GraphTheme, 'background' | 'edgeColor' | 'edgeWidth' | 'fontFamily'>
> & { nodeGap: number } = {
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
