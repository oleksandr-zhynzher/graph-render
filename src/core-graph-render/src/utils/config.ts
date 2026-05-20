import {
  EdgeType,
  type GraphConfig,
  GraphFailureBehavior,
  GraphInputValidationMode,
  type GraphTheme,
  LayoutDirection,
  LayoutType,
  NodeSizingMode,
  type NormalizedGraphConfig,
  RoutingStyle,
} from '@graph-render/types';

import {
  CSS_COLOR_PATTERN,
  DEFAULT_ARROW_PADDING,
  DEFAULT_CONTROL_FILL,
  DEFAULT_CONTROL_FOCUS_STROKE,
  DEFAULT_CONTROL_STROKE,
  DEFAULT_CONTROL_TEXT_COLOR,
  DEFAULT_CURVE_STRENGTH,
  DEFAULT_EDGE_LABEL_COLOR,
  DEFAULT_EDGE_SEPARATION,
  DEFAULT_HEIGHT,
  DEFAULT_HOVER_EDGE_COLOR,
  DEFAULT_HOVER_NODE_IN_COLOR,
  DEFAULT_HOVER_NODE_OUT_COLOR,
  DEFAULT_LABEL_CHAR_WIDTH,
  DEFAULT_LABEL_LINE_HEIGHT,
  DEFAULT_LABEL_OFFSET,
  DEFAULT_LABEL_PADDING_X,
  DEFAULT_LABEL_PADDING_Y,
  DEFAULT_LABEL_PILL_BACKGROUND,
  DEFAULT_LABEL_PILL_BORDER_COLOR,
  DEFAULT_LABEL_PILL_TEXT_COLOR,
  DEFAULT_MARQUEE_FILL,
  DEFAULT_MARQUEE_STROKE,
  DEFAULT_NODE_FILL,
  DEFAULT_NODE_RADIUS,
  DEFAULT_NODE_SIZE,
  DEFAULT_NODE_STROKE,
  DEFAULT_SELF_LOOP_RADIUS,
  DEFAULT_TEXT_FILL,
  DEFAULT_TEXT_SIZE,
  DEFAULT_THEME,
  DEFAULT_WIDTH,
  MAX_DIMENSION,
} from './constants';

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

const getFailureBehavior = (
  value: unknown,
  fallback: GraphFailureBehavior
): GraphFailureBehavior => {
  return value === GraphFailureBehavior.Throw || value === GraphFailureBehavior.Degrade
    ? value
    : fallback;
};

const getInputValidationMode = (
  value: unknown,
  fallback: GraphInputValidationMode
): GraphInputValidationMode => {
  return value === GraphInputValidationMode.Auto ||
    value === GraphInputValidationMode.Strict ||
    value === GraphInputValidationMode.Implicit
    ? value
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

const getNodeSizing = (value: unknown, fallback: NodeSizingMode): NodeSizingMode => {
  return value === NodeSizingMode.Fixed ||
    value === NodeSizingMode.Label ||
    value === NodeSizingMode.Measured
    ? value
    : fallback;
};

const getRoutingStyle = (value: unknown, fallback: RoutingStyle): RoutingStyle => {
  return value === RoutingStyle.Smart ||
    value === RoutingStyle.Orthogonal ||
    value === RoutingStyle.Bundled
    ? value
    : fallback;
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

const normalizeTheme = (theme?: GraphTheme): GraphTheme => {
  const nodeBorderWidth =
    typeof theme?.nodeBorderWidth === 'number' &&
    Number.isFinite(theme.nodeBorderWidth) &&
    theme.nodeBorderWidth >= 0
      ? theme.nodeBorderWidth
      : undefined;

  const nodeTextSize =
    typeof theme?.nodeTextSize === 'number' &&
    Number.isFinite(theme.nodeTextSize) &&
    theme.nodeTextSize > 0
      ? theme.nodeTextSize
      : DEFAULT_TEXT_SIZE;

  const nodeRadius =
    typeof theme?.nodeRadius === 'number' &&
    Number.isFinite(theme.nodeRadius) &&
    theme.nodeRadius >= 0
      ? theme.nodeRadius
      : DEFAULT_NODE_RADIUS;

  return {
    ...theme,
    background: theme?.background ?? DEFAULT_THEME.background,
    edgeColor: theme?.edgeColor ?? DEFAULT_THEME.edgeColor,
    edgeWidth: getFinitePositive(theme?.edgeWidth, DEFAULT_THEME.edgeWidth ?? 2),
    nodeGap: getFinitePositive(theme?.nodeGap, DEFAULT_THEME.nodeGap),
    fontFamily: theme?.fontFamily ?? DEFAULT_THEME.fontFamily,
    nodeFill: theme?.nodeFill ?? DEFAULT_NODE_FILL,
    nodeStroke: theme?.nodeStroke ?? DEFAULT_NODE_STROKE,
    nodeTextColor: theme?.nodeTextColor ?? DEFAULT_TEXT_FILL,
    nodeTextSize,
    nodeRadius,
    marqueeFill: theme?.marqueeFill ?? DEFAULT_MARQUEE_FILL,
    marqueeStroke: theme?.marqueeStroke ?? DEFAULT_MARQUEE_STROKE,
    controlFill: theme?.controlFill ?? DEFAULT_CONTROL_FILL,
    controlStroke: theme?.controlStroke ?? DEFAULT_CONTROL_STROKE,
    controlTextColor: theme?.controlTextColor ?? DEFAULT_CONTROL_TEXT_COLOR,
    controlFocusStroke: theme?.controlFocusStroke ?? DEFAULT_CONTROL_FOCUS_STROKE,
    ...(theme?.nodeBorderColor ? { nodeBorderColor: theme.nodeBorderColor } : {}),
    ...(nodeBorderWidth !== undefined ? { nodeBorderWidth } : {}),
  };
};

export const normalizeGraphConfig = (config?: GraphConfig): NormalizedGraphConfig => {
  return {
    ...config,
    width: getFiniteBounded(config?.width, 1, MAX_DIMENSION, DEFAULT_WIDTH),
    height: getFiniteBounded(config?.height, 1, MAX_DIMENSION, DEFAULT_HEIGHT),
    padding: getFiniteNonNegative(config?.padding, 24),
    defaultEdgeType: getEdgeType(config?.defaultEdgeType, EdgeType.Directed),
    failureBehavior: getFailureBehavior(config?.failureBehavior, GraphFailureBehavior.Throw),
    inputValidationMode: getInputValidationMode(
      config?.inputValidationMode,
      GraphInputValidationMode.Auto
    ),
    showArrows: config?.showArrows ?? true,
    nodeSizing: getNodeSizing(config?.nodeSizing, NodeSizingMode.Fixed),
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
    routingStyle: getRoutingStyle(config?.routingStyle, RoutingStyle.Smart),
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

export { type NormalizedGraphConfig } from '@graph-render/types';
