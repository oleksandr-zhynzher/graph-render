import { fromTypedNxGraph, normalizeEdges } from '@graph-render/core';
import type { PositionedEdge, PositionedNode, Size } from '@graph-render/types';
import { GraphFailureBehavior, NodeSizingMode } from '@graph-render/types';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

import type { GraphModelResult, UseGraphModelOptions } from '../models/graph';
import { resolvePositionedNodes } from '../utils/graphModelLayout';
import { buildEdgeRoutingOptions, buildGraphLayoutOptions } from '../utils/graphModelOptions';
import { resolvePositionedEdges } from '../utils/graphModelRouting';
import { applyMeasuredNodeSizes, pruneMeasuredNodeSizes } from '../utils/graphNodeMeasurements';
import { useGraphSearchState } from './useGraphSearchState';
import { useLatestRef } from './useLatestRef';

export type { GraphModelResult, UseGraphModelOptions } from '../models/graph';

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
  const onErrorRef = useLatestRef(onError);
  const reportedErrorsRef = useRef<WeakSet<Error>>(new WeakSet());
  const deferredSearchQuery = useDeferredValue(searchQuery);

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
    searchQuery: deferredSearchQuery,
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
        if (previous?.width === size.width && previous?.height === size.height) {
          return current;
        }

        return { ...current, [nodeId]: size };
      });
    },
    [config.nodeSizing]
  );

  const positionedNodeResult = useMemo(
    () =>
      resolvePositionedNodes({
        allowDegradedGraph,
        graph,
        layoutNodesOverride,
        layoutOptions,
        visibleNodes,
      }),
    [allowDegradedGraph, graph, layoutNodesOverride, layoutOptions, visibleNodes]
  );
  const positionedNodes: readonly PositionedNode[] = positionedNodeResult.nodes;

  useEffect(() => {
    for (const { context, error } of positionedNodeResult.errors) {
      if (reportedErrorsRef.current.has(error)) {
        continue;
      }
      reportedErrorsRef.current.add(error);
      onErrorRef.current?.(error, context);
    }
  }, [onErrorRef, positionedNodeResult.errors]);

  const edgeRoutingOptions = useMemo(() => buildEdgeRoutingOptions(config), [config]);

  const positionedEdgeResult = useMemo(
    () =>
      resolvePositionedEdges({
        allowDegradedGraph,
        edgeRoutingOptions,
        graph,
        positionedNodes,
        routeEdgesOverride,
        visibleEdges,
      }),
    [
      allowDegradedGraph,
      edgeRoutingOptions,
      graph,
      positionedNodes,
      routeEdgesOverride,
      visibleEdges,
    ]
  );
  const positionedEdges: readonly PositionedEdge[] = positionedEdgeResult.edges;

  useEffect(() => {
    for (const { context, error } of positionedEdgeResult.errors) {
      if (reportedErrorsRef.current.has(error)) {
        continue;
      }
      reportedErrorsRef.current.add(error);
      onErrorRef.current?.(error, context);
    }
  }, [onErrorRef, positionedEdgeResult.errors]);

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
