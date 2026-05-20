import {
  buildFallbackLayout,
  layoutNodes,
  toError,
  validatePositionedNodes,
} from '@graph-render/core';
import { GraphErrorPhase } from '@graph-render/types/react';

import type { ResolvePositionedNodesOptions, ResolvePositionedNodesResult } from '../models/domain';
import type { GraphModelError } from '../models/graph';

export const resolvePositionedNodes = ({
  allowDegradedGraph,
  graph,
  layoutNodesOverride,
  layoutOptions,
  visibleNodes,
}: ResolvePositionedNodesOptions): ResolvePositionedNodesResult => {
  if (!layoutNodesOverride) {
    return resolveDefaultLayout({
      allowDegradedGraph,
      graph,
      layoutOptions,
      visibleNodes,
    });
  }

  const errors: GraphModelErrors = [];
  try {
    const overrideNodes = layoutNodesOverride(layoutOptions);
    validatePositionedNodes(overrideNodes, visibleNodes, 'layout override');
    return { errors, nodes: overrideNodes };
  } catch (error) {
    const normalizedError = toError(error);
    if (!allowDegradedGraph) {
      throw normalizedError;
    }
    errors.push({
      context: { graph, phase: GraphErrorPhase.LayoutOverride },
      error: normalizedError,
    });
  }

  try {
    const fallbackNodes = layoutNodes(layoutOptions);
    validatePositionedNodes(fallbackNodes, visibleNodes, 'layout');
    return { errors, nodes: fallbackNodes };
  } catch (fallbackError) {
    errors.push({
      context: { graph, phase: GraphErrorPhase.Layout },
      error: toError(fallbackError),
    });
  }

  const fallbackResult = resolveFallbackLayout({ layoutOptions, visibleNodes });
  return { errors: [...errors, ...fallbackResult.errors], nodes: fallbackResult.nodes };
};

const resolveDefaultLayout = ({
  allowDegradedGraph,
  graph,
  layoutOptions,
  visibleNodes,
}: Omit<ResolvePositionedNodesOptions, 'layoutNodesOverride'>): ResolvePositionedNodesResult => {
  const errors: GraphModelErrors = [];
  try {
    const laidOutNodes = layoutNodes(layoutOptions);
    validatePositionedNodes(laidOutNodes, visibleNodes, 'layout');
    return { errors, nodes: laidOutNodes };
  } catch (error) {
    const normalizedError = toError(error);
    if (!allowDegradedGraph) {
      throw normalizedError;
    }
    errors.push({ context: { graph, phase: GraphErrorPhase.Layout }, error: normalizedError });
  }

  const fallbackResult = resolveFallbackLayout({ layoutOptions, visibleNodes });
  return { errors: [...errors, ...fallbackResult.errors], nodes: fallbackResult.nodes };
};

const resolveFallbackLayout = ({
  layoutOptions,
  visibleNodes,
}: Pick<
  ResolvePositionedNodesOptions,
  'layoutOptions' | 'visibleNodes'
>): ResolvePositionedNodesResult => {
  try {
    const fallbackNodes = buildFallbackLayout(layoutOptions);
    validatePositionedNodes(fallbackNodes, visibleNodes, 'layout');
    return { errors: [], nodes: fallbackNodes };
  } catch (fallbackError) {
    throw toError(fallbackError);
  }
};

type GraphModelErrors = GraphModelError[];
