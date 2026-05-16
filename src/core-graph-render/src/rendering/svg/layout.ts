import type {
  EdgeData,
  NodeData,
  PositionedEdge,
  PositionedNode,
  RenderConfig,
} from '@graph-render/types';
import { GraphFailureBehavior, LayoutDirection, RoutingStyle } from '@graph-render/types';

import { routeEdges } from '../../edges';
import { layoutNodes } from '../../layouts';
import { buildFallbackEdges, buildFallbackLayout, isFinitePoint, toError } from '../../model';

export const getPositionedNodesWithFallback = (
  sourceNodes: readonly NodeData[],
  normalizedEdges: readonly EdgeData[],
  config: RenderConfig
): readonly PositionedNode[] => {
  try {
    return layoutNodes({
      nodes: sourceNodes,
      edges: normalizedEdges,
      theme: config.mergedTheme,
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
  } catch (error) {
    if (config.failureBehavior !== GraphFailureBehavior.Degrade) {
      throw toError(error);
    }

    return buildFallbackLayout({
      nodes: sourceNodes,
      edges: normalizedEdges,
      theme: config.mergedTheme,
      padding: config.padding,
      layout: config.layout,
      width: config.width,
      height: config.height,
      layoutDirection: LayoutDirection.LTR,
      nodeSizing: config.nodeSizing,
      fixedNodeSize: config.fixedNodeSize,
      labelMeasurementPaddingX: config.labelMeasurementPaddingX,
      labelMeasurementPaddingY: config.labelMeasurementPaddingY,
      labelMeasurementCharWidth: config.labelMeasurementCharWidth,
      labelMeasurementLineHeight: config.labelMeasurementLineHeight,
    });
  }
};

export const getPositionedEdgesWithFallback = (
  positionedNodes: readonly PositionedNode[],
  normalizedEdges: readonly EdgeData[],
  config: RenderConfig
): readonly PositionedEdge[] => {
  try {
    const routedEdges = routeEdges(positionedNodes, normalizedEdges, {
      arrowPadding: config.arrowPadding,
      straight: !config.curveEdges || config.routingStyle === RoutingStyle.Orthogonal,
      layoutDirection: config.layoutDirection,
      forceRightToLeft: config.forceRightToLeft ?? false,
      routingStyle: config.routingStyle,
      edgeSeparation: config.edgeSeparation,
      selfLoopRadius: config.selfLoopRadius,
    });

    return routedEdges.filter(
      (edge) => edge.points.length >= 2 && edge.points.every((point) => isFinitePoint(point))
    );
  } catch (error) {
    if (config.failureBehavior !== GraphFailureBehavior.Degrade) {
      throw toError(error);
    }

    return buildFallbackEdges(positionedNodes, normalizedEdges);
  }
};
