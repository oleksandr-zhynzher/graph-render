import { LayoutDirection } from '@graph-render/types';
import type { EdgeData, NodeData, PositionedEdge, PositionedNode } from '@graph-render/types';
import type { RenderConfig } from '@graph-render/types';
import { routeEdges } from '../../edges';
import { layoutNodes } from '../../layouts';
import { buildFallbackEdges, buildFallbackLayout, isFinitePoint, toError } from '../../model';

export const getPositionedNodesWithFallback = (
  sourceNodes: NodeData[],
  normalizedEdges: EdgeData[],
  config: RenderConfig
): PositionedNode[] => {
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
    if (config.failureBehavior !== 'degrade') {
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
  positionedNodes: PositionedNode[],
  normalizedEdges: EdgeData[],
  config: RenderConfig
): PositionedEdge[] => {
  try {
    const routedEdges = routeEdges(positionedNodes, normalizedEdges, {
      arrowPadding: config.arrowPadding,
      straight: !config.curveEdges || config.routingStyle === 'orthogonal',
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
    if (config.failureBehavior !== 'degrade') {
      throw toError(error);
    }

    return buildFallbackEdges(positionedNodes, normalizedEdges);
  }
};
