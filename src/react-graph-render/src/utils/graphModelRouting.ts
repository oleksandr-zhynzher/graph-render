import {
  buildFallbackEdges,
  routeEdges,
  toError,
  validatePositionedEdges,
} from '@graph-render/core';
import type { EdgeData, PositionedEdge, PositionedNode } from '@graph-render/types';
import type { ResolvePositionedEdgesOptions } from '../models/utils';

export const resolvePositionedEdges = ({
  allowDegradedGraph,
  edgeRoutingOptions,
  graph,
  onError,
  positionedNodes,
  routeEdgesOverride,
  visibleEdges,
}: ResolvePositionedEdgesOptions): PositionedEdge[] => {
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
    onError?.(normalizedError, { graph, phase: 'routing-override' });
    if (!allowDegradedGraph) {
      throw normalizedError;
    }
  }

  try {
    const fallbackEdges = routeEdges(positionedNodes, visibleEdges, edgeRoutingOptions);
    validatePositionedEdges(fallbackEdges, nodeIds, 'routing');
    return fallbackEdges;
  } catch (fallbackError) {
    onError?.(toError(fallbackError), { graph, phase: 'routing' });
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
  nodeIds: Set<string>;
}): PositionedEdge[] => {
  try {
    const routedEdges = routeEdges(positionedNodes, visibleEdges, edgeRoutingOptions);
    validatePositionedEdges(routedEdges, nodeIds, 'routing');
    return routedEdges;
  } catch (error) {
    const normalizedError = toError(error);
    onError?.(normalizedError, { graph, phase: 'routing' });
    if (!allowDegradedGraph) {
      throw normalizedError;
    }
    return buildValidatedFallbackEdges(positionedNodes, visibleEdges, nodeIds);
  }
};

const buildValidatedFallbackEdges = (
  positionedNodes: PositionedNode[],
  visibleEdges: EdgeData[],
  nodeIds: Set<string>
): PositionedEdge[] => {
  const fallbackEdges = buildFallbackEdges(positionedNodes, visibleEdges);
  validatePositionedEdges(fallbackEdges, nodeIds, 'routing');
  return fallbackEdges;
};
