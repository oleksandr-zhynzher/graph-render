import { fromTypedNxGraph, normalizeEdges } from '@graph-render/core';
import type { PositionedEdge, PositionedNode, Size } from '@graph-render/types';
import { GraphFailureBehavior, NodeSizingMode } from '@graph-render/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { resolvePositionedNodes } from '../utils/graphModelLayout';
import { buildEdgeRoutingOptions, buildGraphLayoutOptions } from '../utils/graphModelOptions';
import { resolvePositionedEdges } from '../utils/graphModelRouting';
import { applyMeasuredNodeSizes, pruneMeasuredNodeSizes } from '../utils/graphNodeMeasurements';
import type { GraphModelResult, UseGraphModelOptions } from './graphModelTypes';
import { useGraphSearchState } from './useGraphSearchState';

export type { GraphModelResult } from './graphModelTypes';

export const useGraphModel = ({
  graph,
  config,
  mergedTheme,
  collapsedIds,
  hiddenNodeIds,
  searchQuery,
  hideUnmatchedSearch = false,
  searchPredicate,
  highlightedNodeIds,
  highlightedEdgeIds,
  highlightStrategy,
  onSearchResultsChange,
  layoutNodesOverride,
  routeEdgesOverride,
  onError,
}: UseGraphModelOptions): GraphModelResult => {
  const [measuredNodeSizes, setMeasuredNodeSizes] = useState<Record<string, Size>>({});

  const { nodes: sourceNodes, edges: sourceEdges } = useMemo(
    () =>
      fromTypedNxGraph(graph, config.defaultEdgeType, {
        inputValidationMode: config.inputValidationMode,
      }),
    [config.defaultEdgeType, config.inputValidationMode, graph]
  );

  const allowDegradedGraph = config.failureBehavior === GraphFailureBehavior.Degrade;

  const nodesWithMeasuredSize = useMemo(
    () => applyMeasuredNodeSizes(sourceNodes, measuredNodeSizes),
    [measuredNodeSizes, sourceNodes]
  );

  useEffect(() => {
    setMeasuredNodeSizes((current) => pruneMeasuredNodeSizes(current, sourceNodes));
  }, [sourceNodes]);

  const normalizedEdges = useMemo(
    () => normalizeEdges(sourceEdges, config.defaultEdgeType),
    [config.defaultEdgeType, sourceEdges]
  );

  const searchState = useGraphSearchState({
    nodes: nodesWithMeasuredSize,
    edges: normalizedEdges,
    collapsedIds,
    hiddenNodeIds,
    searchQuery,
    hideUnmatchedSearch,
    searchPredicate,
    highlightedNodeIds,
    highlightedEdgeIds,
    highlightStrategy,
    onSearchResultsChange,
  });
  const {
    childNodeIdsByParent,
    effectiveHighlightedEdgeSet,
    effectiveHighlightedNodeSet,
    visibleEdges,
    visibleNodes,
  } = searchState;

  const layoutOptions = useMemo(
    () =>
      buildGraphLayoutOptions({
        config,
        edges: visibleEdges,
        mergedTheme,
        nodes: visibleNodes,
      }),
    [config, mergedTheme, visibleEdges, visibleNodes]
  );

  const handleNodeMeasure = useCallback(
    (nodeId: string, size: Size) => {
      if (config.nodeSizing !== NodeSizingMode.Measured) {
        return;
      }

      setMeasuredNodeSizes((current) => {
        const previous = current[nodeId];
        if (previous && previous.width === size.width && previous.height === size.height) {
          return current;
        }

        return { ...current, [nodeId]: size };
      });
    },
    [config.nodeSizing]
  );

  const positionedNodes: readonly PositionedNode[] = useMemo(
    () =>
      resolvePositionedNodes({
        allowDegradedGraph,
        graph,
        layoutNodesOverride,
        layoutOptions,
        onError,
        visibleNodes,
      }),
    [allowDegradedGraph, graph, layoutNodesOverride, layoutOptions, onError, visibleNodes]
  );

  const edgeRoutingOptions = useMemo(() => buildEdgeRoutingOptions(config), [config]);

  const positionedEdges: readonly PositionedEdge[] = useMemo(
    () =>
      resolvePositionedEdges({
        allowDegradedGraph,
        edgeRoutingOptions,
        graph,
        onError,
        positionedNodes,
        routeEdgesOverride,
        visibleEdges,
      }),
    [
      allowDegradedGraph,
      edgeRoutingOptions,
      graph,
      onError,
      positionedNodes,
      routeEdgesOverride,
      visibleEdges,
    ]
  );

  return {
    childNodeIdsByParent,
    effectiveHighlightedEdgeSet,
    effectiveHighlightedNodeSet,
    handleNodeMeasure,
    positionedEdges,
    positionedNodes,
    visibleEdges,
    visibleNodesWithMeasuredSize: visibleNodes,
  };
};
