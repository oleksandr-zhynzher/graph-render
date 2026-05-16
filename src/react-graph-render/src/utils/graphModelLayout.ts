import {
  buildFallbackLayout,
  layoutNodes,
  toError,
  validatePositionedNodes,
} from '@graph-render/core';
import type { PositionedNode } from '@graph-render/types';
import type { ResolvePositionedNodesOptions } from '../models/utils';

export const resolvePositionedNodes = ({
  allowDegradedGraph,
  graph,
  layoutNodesOverride,
  layoutOptions,
  onError,
  visibleNodes,
}: ResolvePositionedNodesOptions): PositionedNode[] => {
  if (!layoutNodesOverride) {
    return resolveDefaultLayout({
      allowDegradedGraph,
      graph,
      layoutOptions,
      onError,
      visibleNodes,
    });
  }

  try {
    const overrideNodes = layoutNodesOverride(layoutOptions);
    validatePositionedNodes(overrideNodes, visibleNodes, 'layout override');
    return overrideNodes;
  } catch (error) {
    const normalizedError = toError(error);
    onError?.(normalizedError, { graph, phase: 'layout-override' });
    if (!allowDegradedGraph) {
      throw normalizedError;
    }
  }

  try {
    const fallbackNodes = layoutNodes(layoutOptions);
    validatePositionedNodes(fallbackNodes, visibleNodes, 'layout');
    return fallbackNodes;
  } catch (fallbackError) {
    onError?.(toError(fallbackError), { graph, phase: 'layout' });
  }

  return resolveFallbackLayout({ graph, layoutOptions, onError, visibleNodes });
};

const resolveDefaultLayout = ({
  allowDegradedGraph,
  graph,
  layoutOptions,
  onError,
  visibleNodes,
}: Omit<ResolvePositionedNodesOptions, 'layoutNodesOverride'>): PositionedNode[] => {
  try {
    const laidOutNodes = layoutNodes(layoutOptions);
    validatePositionedNodes(laidOutNodes, visibleNodes, 'layout');
    return laidOutNodes;
  } catch (error) {
    const normalizedError = toError(error);
    onError?.(normalizedError, { graph, phase: 'layout' });
    if (!allowDegradedGraph) {
      throw normalizedError;
    }
  }

  return resolveFallbackLayout({ graph, layoutOptions, onError, visibleNodes });
};

const resolveFallbackLayout = ({
  graph,
  layoutOptions,
  onError,
  visibleNodes,
}: Omit<ResolvePositionedNodesOptions, 'allowDegradedGraph' | 'layoutNodesOverride'>) => {
  try {
    const fallbackNodes = buildFallbackLayout(layoutOptions);
    validatePositionedNodes(fallbackNodes, visibleNodes, 'layout');
    return fallbackNodes;
  } catch (fallbackError) {
    const normalizedFallbackError = toError(fallbackError);
    onError?.(normalizedFallbackError, { graph, phase: 'layout' });
    throw normalizedFallbackError;
  }
};
