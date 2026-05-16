import type { GraphControlsPosition, GraphSelection, GraphViewport } from '@graph-render/types';

export const DEFAULT_VIEWPORT: GraphViewport = { x: 0, y: 0, zoom: 1 };
export const DEFAULT_SELECTION: GraphSelection = { nodeIds: [], edgeIds: [] };
export const DEFAULT_MIN_ZOOM = 0.25;
export const DEFAULT_MAX_ZOOM = 2.5;
export const DEFAULT_ZOOM_STEP = 0.12;
export const DEFAULT_SELECTION_COLOR = '#f59e0b';
export const DEFAULT_CONTROLS_POSITION: GraphControlsPosition = 'top-left';
export const CONTROL_BUTTON_SIZE = 26;
export const CONTROL_LABEL_BUTTON_WIDTH = 34;
export const CONTROL_BUTTON_GAP = 8;
export const EDGE_LABEL_WIDTH = 48;
export const EDGE_LABEL_HEIGHT = 20;
export const FIT_BOUNDS_MARGIN = 8;
export const DEFAULT_NODE_HEIGHT = 72;
export const DEFAULT_NODE_RADIUS = 8;
export const DEFAULT_NODE_WIDTH = 180;
