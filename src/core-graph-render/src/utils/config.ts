import {
  EdgeType,
  GraphConfig,
  GraphTheme,
  LayoutDirection,
  LayoutType,
} from '@graph-render/types';
import { DEFAULT_THEME, DEFAULT_NODE_SIZE } from './constants';

const DEFAULT_WIDTH = 960;
const DEFAULT_HEIGHT = 720;
const MAX_DIMENSION = 32768;
const DEFAULT_CURVE_STRENGTH = 0.3;
const DEFAULT_ARROW_PADDING = 6;
const DEFAULT_EDGE_SEPARATION = 18;
const DEFAULT_SELF_LOOP_RADIUS = 32;
const DEFAULT_LABEL_OFFSET = 32;
const DEFAULT_LABEL_PADDING_X = 18;
const DEFAULT_LABEL_PADDING_Y = 12;
const DEFAULT_LABEL_CHAR_WIDTH = 8;
const DEFAULT_LABEL_LINE_HEIGHT = 18;
const DEFAULT_HOVER_EDGE_COLOR = '#4da3ff';
const DEFAULT_HOVER_NODE_IN_COLOR = '#2ecc71';
const DEFAULT_HOVER_NODE_OUT_COLOR = '#ff5b5b';
const DEFAULT_EDGE_LABEL_COLOR = '#334155';
const DEFAULT_LABEL_PILL_BACKGROUND = '#eef1f6';
const DEFAULT_LABEL_PILL_BORDER_COLOR = '#d7dbe3';
const DEFAULT_LABEL_PILL_TEXT_COLOR = '#3f434b';
const CSS_COLOR_PATTERN =
  /^(#[0-9a-fA-F]{3,8}|(?:rgb|hsl)a?\([0-9\s.,%+-]+\)|[a-zA-Z][a-zA-Z0-9-]*|var\(--[a-zA-Z0-9-_]+\))$/;

const getFinitePositive = (value: unknown, fallback: number): number => {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
};

const getFiniteNonNegative = (value: unknown, fallback: number): number => {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
};

const getFiniteBounded = (value: unknown, min: number, max: number, fallback: number): number => {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(Math.max(value, min), max)
    : fallback;
};

const sanitizeCssColor = (value: unknown, fallback: string): string => {
  const normalized = String(value ?? '').trim();
  return CSS_COLOR_PATTERN.test(normalized) ? normalized : fallback;
};

const getEdgeType = (value: unknown, fallback: EdgeType): EdgeType => {
  return value === EdgeType.Directed || value === EdgeType.Undirected ? value : fallback;
};

const getLayoutType = (value: unknown, fallback: LayoutType): LayoutType => {
  return Object.values(LayoutType).includes(value as LayoutType) ? (value as LayoutType) : fallback;
};

const getLayoutDirection = (value: unknown, fallback: LayoutDirection): LayoutDirection => {
  return value === LayoutDirection.LTR || value === LayoutDirection.RTL ? value : fallback;
};

const getNodeSizing = (value: unknown, fallback: NonNullable<GraphConfig['nodeSizing']>) => {
  return value === 'fixed' || value === 'label' || value === 'measured' ? value : fallback;
};

const getRoutingStyle = (
  value: unknown,
  fallback: NonNullable<GraphConfig['routingStyle']>
): NonNullable<GraphConfig['routingStyle']> => {
  return value === 'smart' || value === 'orthogonal' || value === 'bundled' ? value : fallback;
};

const normalizeFixedNodeSize = (value: unknown): NonNullable<GraphConfig['fixedNodeSize']> => {
  if (!value || typeof value !== 'object') {
    return DEFAULT_NODE_SIZE;
  }

  const width = getFinitePositive(
    (value as GraphConfig['fixedNodeSize'])?.width,
    DEFAULT_NODE_SIZE.width
  );
  const height = getFinitePositive(
    (value as GraphConfig['fixedNodeSize'])?.height,
    DEFAULT_NODE_SIZE.height
  );

  return { width, height };
};

const normalizeTheme = (theme?: GraphTheme): GraphTheme => ({
  ...DEFAULT_THEME,
  ...theme,
  edgeWidth: getFinitePositive(theme?.edgeWidth, DEFAULT_THEME.edgeWidth),
  nodeGap: getFinitePositive(theme?.nodeGap, DEFAULT_THEME.nodeGap),
  nodeBorderWidth:
    typeof theme?.nodeBorderWidth === 'number' &&
    Number.isFinite(theme.nodeBorderWidth) &&
    theme.nodeBorderWidth >= 0
      ? theme.nodeBorderWidth
      // FIX: was `theme?.nodeBorderWidth`, which passed invalid values (e.g.,
      // the string "2px") straight through to the SVG stroke-width attribute.
      // All other config fields fall back to a safe default; this now does too.
      : undefined,
});

export interface NormalizedGraphConfig extends Omit<GraphConfig, 'theme' | 'fixedNodeSize'> {
  width: number;
  height: number;
  padding: number;
  defaultEdgeType: EdgeType;
  showArrows: boolean;
  nodeSizing: NonNullable<GraphConfig['nodeSizing']>;
  fixedNodeSize: NonNullable<GraphConfig['fixedNodeSize']>;
  theme: GraphTheme;
  curveEdges: boolean;
  curveStrength: number;
  arrowPadding: number;
  routingStyle: NonNullable<GraphConfig['routingStyle']>;
  edgeSeparation: number;
  selfLoopRadius: number;
  edgeLabelColor: string;
  layout: LayoutType;
  layoutDirection: LayoutDirection;
  hoverHighlight: boolean;
  hoverEdgeColor: string;
  hoverNodeInColor: string;
  hoverNodeOutColor: string;
  hoverNodeHighlight: boolean;
  autoLabels: boolean;
  labelOffset: number;
  labelPillBackground: string;
  labelPillBorderColor: string;
  labelPillTextColor: string;
  labelMeasurementPaddingX: number;
  labelMeasurementPaddingY: number;
  labelMeasurementCharWidth: number;
  labelMeasurementLineHeight: number;
}

export const normalizeGraphConfig = (config?: GraphConfig): NormalizedGraphConfig => {
  return {
    ...config,
    width: getFiniteBounded(config?.width, 1, MAX_DIMENSION, DEFAULT_WIDTH),
    height: getFiniteBounded(config?.height, 1, MAX_DIMENSION, DEFAULT_HEIGHT),
    padding: getFiniteNonNegative(config?.padding, 24),
    defaultEdgeType: getEdgeType(config?.defaultEdgeType, EdgeType.Directed),
    showArrows: config?.showArrows ?? true,
    nodeSizing: getNodeSizing(config?.nodeSizing, 'fixed'),
    fixedNodeSize: normalizeFixedNodeSize(config?.fixedNodeSize),
    labelMeasurementPaddingX: getFiniteNonNegative(
      config?.labelMeasurementPaddingX,
      DEFAULT_LABEL_PADDING_X
    ),
    labelMeasurementPaddingY: getFiniteNonNegative(
      config?.labelMeasurementPaddingY,
      DEFAULT_LABEL_PADDING_Y
    ),
    labelMeasurementCharWidth: getFinitePositive(
      config?.labelMeasurementCharWidth,
      DEFAULT_LABEL_CHAR_WIDTH
    ),
    labelMeasurementLineHeight: getFinitePositive(
      config?.labelMeasurementLineHeight,
      DEFAULT_LABEL_LINE_HEIGHT
    ),
    theme: normalizeTheme(config?.theme),
    curveEdges: config?.curveEdges ?? true,
    curveStrength: getFiniteBounded(config?.curveStrength, 0, 1, DEFAULT_CURVE_STRENGTH),
    arrowPadding: getFiniteNonNegative(config?.arrowPadding, DEFAULT_ARROW_PADDING),
    routingStyle: getRoutingStyle(config?.routingStyle, 'smart'),
    edgeSeparation: getFinitePositive(config?.edgeSeparation, DEFAULT_EDGE_SEPARATION),
    selfLoopRadius: getFinitePositive(config?.selfLoopRadius, DEFAULT_SELF_LOOP_RADIUS),
    edgeLabelColor: config?.edgeLabelColor ?? DEFAULT_EDGE_LABEL_COLOR,
    layout: getLayoutType(config?.layout, LayoutType.Centered),
    layoutDirection: getLayoutDirection(config?.layoutDirection, LayoutDirection.LTR),
    hoverHighlight: config?.hoverHighlight ?? true,
    hoverEdgeColor: config?.hoverEdgeColor ?? DEFAULT_HOVER_EDGE_COLOR,
    hoverNodeBorderColor: config?.hoverNodeBorderColor,
    hoverNodeInColor: config?.hoverNodeInColor ?? DEFAULT_HOVER_NODE_IN_COLOR,
    hoverNodeOutColor: config?.hoverNodeOutColor ?? DEFAULT_HOVER_NODE_OUT_COLOR,
    hoverNodeBothColor: config?.hoverNodeBothColor,
    hoverNodeHighlight: config?.hoverNodeHighlight ?? true,
    labels: config?.labels,
    autoLabels: config?.autoLabels ?? false,
    labelOffset: getFiniteNonNegative(config?.labelOffset, DEFAULT_LABEL_OFFSET),
    labelPillBackground: sanitizeCssColor(
      config?.labelPillBackground,
      DEFAULT_LABEL_PILL_BACKGROUND
    ),
    labelPillBorderColor: sanitizeCssColor(
      config?.labelPillBorderColor,
      DEFAULT_LABEL_PILL_BORDER_COLOR
    ),
    labelPillTextColor: sanitizeCssColor(config?.labelPillTextColor, DEFAULT_LABEL_PILL_TEXT_COLOR),
    forceRightToLeft: config?.forceRightToLeft ?? false,
  };
};
