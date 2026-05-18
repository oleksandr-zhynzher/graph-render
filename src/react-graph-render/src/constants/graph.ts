import type { GraphSelection, GraphViewport } from '@graph-render/types';
import { GraphControlsPosition } from '@graph-render/types';

export const DEFAULT_VIEWPORT: GraphViewport = { x: 0, y: 0, zoom: 1 };
export const DEFAULT_SELECTION: GraphSelection = { nodeIds: [], edgeIds: [] };
export const DEFAULT_MIN_ZOOM = 0.25;
export const DEFAULT_MAX_ZOOM = 2.5;
export const DEFAULT_ZOOM_STEP = 0.12;
export const DEFAULT_SELECTION_COLOR = '#f59e0b';
export const DEFAULT_CONTROLS_POSITION: GraphControlsPosition = GraphControlsPosition.TopLeft;
export const CONTROL_BUTTON_SIZE = 26;
export const CONTROL_LABEL_BUTTON_WIDTH = 34;
export const CONTROL_BUTTON_GAP = 8;
export const EDGE_LABEL_WIDTH = 48;
export const EDGE_LABEL_HEIGHT = 20;
export const FIT_BOUNDS_MARGIN = 8;
export const DEFAULT_NODE_HEIGHT = 72;
export const DEFAULT_NODE_RADIUS = 8;
export const DEFAULT_NODE_WIDTH = 180;

export const DEFAULT_COLUMN_TOLERANCE = 24;

export const CONTROL_DEFS = [
  { key: 'zoom-in', label: '+', ariaLabel: 'Zoom in', width: CONTROL_BUTTON_SIZE },
  { key: 'zoom-out', label: '−', ariaLabel: 'Zoom out', width: CONTROL_BUTTON_SIZE },
  { key: 'fit-view', label: 'Fit', ariaLabel: 'Fit view', width: CONTROL_LABEL_BUTTON_WIDTH },
  {
    key: 'reset-view',
    label: '1:1',
    ariaLabel: 'Reset to 100%',
    width: CONTROL_LABEL_BUTTON_WIDTH,
  },
] as const;

export const CONTROL_X_POSITIONS = CONTROL_DEFS.reduce<number[]>((acc, _def, i) => {
  const previousX = acc[i - 1] ?? 0;
  const previousWidth = CONTROL_DEFS[i - 1]?.width ?? 0;
  acc.push(i === 0 ? 0 : previousX + previousWidth + CONTROL_BUTTON_GAP);
  return acc;
}, []);
