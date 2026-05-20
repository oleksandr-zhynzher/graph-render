import {
  buildFallbackEdges,
  routeEdges,
  toError,
  validatePositionedEdges,
} from '@graph-render/core';
import type { EdgeData, PositionedEdge, PositionedNode } from '@graph-render/types';
import { GraphErrorPhase } from '@graph-render/types/react';

import type { ResolvePositionedEdgesOptions, ResolvePositionedEdgesResult } from '../models/domain';
import type { GraphModelError } from '../models/graph';

export const resolvePositionedEdges = ({
  allowDegradedGraph,
  edgeRoutingOptions,
  graph,
  positionedNodes,
  routeEdgesOverride,
  visibleEdges,
}: ResolvePositionedEdgesOptions): ResolvePositionedEdgesResult => {
  const nodeIds = new Set(positionedNodes.map((node) => node.id));

  if (!routeEdgesOverride) {
    return resolveDefaultRouting({
      allowDegradedGraph,
      edgeRoutingOptions,
      graph,
      nodeIds,
      positionedNodes,
      visibleEdges,
    });
  }

  const errors: GraphModelErrors = [];
  try {
    const overrideEdges = routeEdgesOverride(positionedNodes, visibleEdges, edgeRoutingOptions);
    validatePositionedEdges(overrideEdges, nodeIds, 'routing override');
    return { edges: overrideEdges, errors };
  } catch (error) {
    const normalizedError = toError(error);
    if (!allowDegradedGraph) {
      throw normalizedError;
    }
    errors.push({
      context: { graph, phase: GraphErrorPhase.RoutingOverride },
      error: normalizedError,
    });
  }

  try {
    const fallbackEdges = routeEdges(positionedNodes, visibleEdges, edgeRoutingOptions);
    validatePositionedEdges(fallbackEdges, nodeIds, 'routing');
    return { edges: fallbackEdges, errors };
  } catch (fallbackError) {
    errors.push({
      context: { graph, phase: GraphErrorPhase.Routing },
      error: toError(fallbackError),
    });
    return { edges: buildValidatedFallbackEdges(positionedNodes, visibleEdges, nodeIds), errors };
  }
};

const resolveDefaultRouting = ({
  allowDegradedGraph,
  edgeRoutingOptions,
  graph,
  nodeIds,
  positionedNodes,
  visibleEdges,
}: Omit<ResolvePositionedEdgesOptions, 'routeEdgesOverride'> & {
  readonly nodeIds: ReadonlySet<string>;
}): ResolvePositionedEdgesResult => {
  const errors: GraphModelErrors = [];
  try {
    const routedEdges = routeEdges(positionedNodes, visibleEdges, edgeRoutingOptions);
    validatePositionedEdges(routedEdges, nodeIds, 'routing');
    return { edges: routedEdges, errors };
  } catch (error) {
    const normalizedError = toError(error);
    if (!allowDegradedGraph) {
      throw normalizedError;
    }
    errors.push({ context: { graph, phase: GraphErrorPhase.Routing }, error: normalizedError });
    return { edges: buildValidatedFallbackEdges(positionedNodes, visibleEdges, nodeIds), errors };
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

type GraphModelErrors = GraphModelError[];
