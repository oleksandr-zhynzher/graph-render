import { useCallback, useEffect, useMemo, useState } from 'react';
import { fromTypedNxGraph, normalizeEdges } from '@graph-render/core';
import type { PositionedEdge, PositionedNode, Size } from '@graph-render/types';
import type { GraphModelResult, UseGraphModelOptions } from './graphModelTypes';
import { useGraphSearchState } from './useGraphSearchState';
import { buildEdgeRoutingOptions, buildGraphLayoutOptions } from '../utils/graphModelOptions';
import { resolvePositionedNodes } from '../utils/graphModelLayout';
import { resolvePositionedEdges } from '../utils/graphModelRouting';
import { applyMeasuredNodeSizes, pruneMeasuredNodeSizes } from '../utils/graphNodeMeasurements';

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

  const allowDegradedGraph = config.failureBehavior === 'degrade';

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
  const { visibleEdges, visibleNodes } = searchState;

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
      if (config.nodeSizing !== 'measured') {
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

  const positionedNodes: PositionedNode[] = useMemo(
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

  const positionedEdges: PositionedEdge[] = useMemo(
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
    childNodeIdsByParent: searchState.childNodeIdsByParent,
    effectiveHighlightedEdgeSet: searchState.effectiveHighlightedEdgeSet,
    effectiveHighlightedNodeSet: searchState.effectiveHighlightedNodeSet,
    handleNodeMeasure,
    positionedEdges,
    positionedNodes,
    visibleEdges,
    visibleNodesWithMeasuredSize: visibleNodes,
  };
};
