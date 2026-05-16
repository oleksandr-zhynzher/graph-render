import type { LayoutOptions, NormalizedGraphConfig, RouteEdgesOptions } from '@graph-render/types';
import { RoutingStyle } from '@graph-render/types';

import type { GraphLayoutOptionsInput } from '../models/utils';

export const buildGraphLayoutOptions = ({
  config,
  edges,
  mergedTheme,
  nodes,
}: GraphLayoutOptionsInput): LayoutOptions => ({
  nodes,
  edges,
  theme: mergedTheme,
  padding: config.padding,
  layout: config.layout,
  width: config.width,
  height: config.height,
  layoutDirection: config.layoutDirection,
  nodeSizing: config.nodeSizing,
  fixedNodeSize: config.fixedNodeSize,
  labelMeasurementPaddingX: config.labelMeasurementPaddingX,
  labelMeasurementPaddingY: config.labelMeasurementPaddingY,
  labelMeasurementCharWidth: config.labelMeasurementCharWidth,
  labelMeasurementLineHeight: config.labelMeasurementLineHeight,
});

export const buildEdgeRoutingOptions = (config: NormalizedGraphConfig): RouteEdgesOptions => ({
  arrowPadding: config.arrowPadding,
  straight: !config.curveEdges || config.routingStyle === RoutingStyle.Orthogonal,
  layoutDirection: config.layoutDirection,
  forceRightToLeft: config.forceRightToLeft,
  routingStyle: config.routingStyle,
  edgeSeparation: config.edgeSeparation,
  selfLoopRadius: config.selfLoopRadius,
});
