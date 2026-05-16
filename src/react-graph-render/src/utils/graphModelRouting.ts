import {
  buildFallbackEdges,
  routeEdges,
  toError,
  validatePositionedEdges,
} from '@graph-render/core';
import type { EdgeData, PositionedEdge, PositionedNode } from '@graph-render/types';
import { GraphErrorPhase } from '@graph-render/types';

import type { ResolvePositionedEdgesOptions } from '../models/utils';

export const resolvePositionedEdges = ({
  allowDegradedGraph,
  edgeRoutingOptions,
  graph,
  onError,
  positionedNodes,
  routeEdgesOverride,
  visibleEdges,
}: ResolvePositionedEdgesOptions): readonly PositionedEdge[] => {
  const nodeIds = new Set(positionedNodes.map((node) => node.id));

  if (!routeEdgesOverride) {
    return resolveDefaultRouting({
      allowDegradedGraph,
      edgeRoutingOptions,
      graph,
      nodeIds,
      onError,
      positionedNodes,
      visibleEdges,
    });
  }

  try {
    const overrideEdges = routeEdgesOverride(positionedNodes, visibleEdges, edgeRoutingOptions);
    validatePositionedEdges(overrideEdges, nodeIds, 'routing override');
    return overrideEdges;
  } catch (error) {
    const normalizedError = toError(error);
    onError?.(normalizedError, { graph, phase: GraphErrorPhase.RoutingOverride });
    if (!allowDegradedGraph) {
      throw normalizedError;
    }
  }

  try {
    const fallbackEdges = routeEdges(positionedNodes, visibleEdges, edgeRoutingOptions);
    validatePositionedEdges(fallbackEdges, nodeIds, 'routing');
    return fallbackEdges;
  } catch (fallbackError) {
    onError?.(toError(fallbackError), { graph, phase: GraphErrorPhase.Routing });
    return buildValidatedFallbackEdges(positionedNodes, visibleEdges, nodeIds);
  }
};

const resolveDefaultRouting = ({
  allowDegradedGraph,
  edgeRoutingOptions,
  graph,
  nodeIds,
  onError,
  positionedNodes,
  visibleEdges,
}: Omit<ResolvePositionedEdgesOptions, 'routeEdgesOverride'> & {
  readonly nodeIds: ReadonlySet<string>;
}): readonly PositionedEdge[] => {
  try {
    const routedEdges = routeEdges(positionedNodes, visibleEdges, edgeRoutingOptions);
    validatePositionedEdges(routedEdges, nodeIds, 'routing');
    return routedEdges;
  } catch (error) {
    const normalizedError = toError(error);
    onError?.(normalizedError, { graph, phase: GraphErrorPhase.Routing });
    if (!allowDegradedGraph) {
      throw normalizedError;
    }
    return buildValidatedFallbackEdges(positionedNodes, visibleEdges, nodeIds);
  }
};

const buildValidatedFallbackEdges = (
  positionedNodes: readonly PositionedNode[],
  visibleEdges: readonly EdgeData[],
  nodeIds: ReadonlySet<string>
): readonly PositionedEdge[] => {
  const fallbackEdges = buildFallbackEdges(positionedNodes, visibleEdges);
  validatePositionedEdges(fallbackEdges, nodeIds, 'routing');
  return fallbackEdges;
};
