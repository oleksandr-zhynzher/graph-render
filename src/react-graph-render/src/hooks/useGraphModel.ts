import { useCallback, useEffect, useMemo, useState } from 'react';
import { fromTypedNxGraph, layoutNodes, routeEdges } from '@graph-render/core';
import {
  EdgeData,
  GraphConfig,
  GraphSearchResults,
  LayoutOptions,
  NodeData,
  NxGraphInput,
  PositionedEdge,
  PositionedNode,
  RouteEdgesOptions,
} from '@graph-render/types';
import type { NormalizedGraphConfig } from '@graph-render/core';
import { useGraphSearchState } from './useGraphSearchState';

interface UseGraphModelOptions {
  graph: NxGraphInput;
  config: NormalizedGraphConfig;
  mergedTheme: NonNullable<GraphConfig['theme']>;
  collapsedIds: string[];
  hiddenNodeIds?: string[];
  searchQuery?: string;
  hideUnmatchedSearch?: boolean;
  searchPredicate?: (node: NodeData, query: string) => boolean;
  highlightedNodeIds?: string[];
  highlightedEdgeIds?: string[];
  highlightStrategy?: (context: {
    nodes: NodeData[];
    edges: EdgeData[];
    query: string;
    matchedNodeIds: string[];
    matchedEdgeIds: string[];
  }) => Partial<GraphSearchResults>;
  onSearchResultsChange?: (results: GraphSearchResults) => void;
  layoutNodesOverride?: (options: LayoutOptions) => PositionedNode[];
  routeEdgesOverride?: (
    nodes: PositionedNode[],
    edges: EdgeData[],
    options?: RouteEdgesOptions
  ) => PositionedEdge[];
  onError?: (error: Error, context: { graph: NxGraphInput; phase: 'layout-override' | 'routing-override' }) => void;
}

export interface GraphModelResult {
  childNodeIdsByParent: Map<string, string[]>;
  effectiveHighlightedEdgeSet: Set<string>;
  effectiveHighlightedNodeSet: Set<string>;
  handleNodeMeasure: (nodeId: string, size: { width: number; height: number }) => void;
  positionedEdges: PositionedEdge[];
  positionedNodes: PositionedNode[];
  visibleEdges: EdgeData[];
  visibleNodesWithMeasuredSize: NodeData[];
}

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
  const [measuredNodeSizes, setMeasuredNodeSizes] = useState<
    Record<string, { width: number; height: number }>
  >({});

  const { nodes: sourceNodes, edges: sourceEdges } = useMemo(
    () => fromTypedNxGraph(graph, config.defaultEdgeType),
    [config.defaultEdgeType, graph]
  );

  const nodesWithMeasuredSize = useMemo(
    () =>
      sourceNodes.map((node) => ({
        ...node,
        measuredSize: measuredNodeSizes[node.id] ?? node.measuredSize,
      })),
    [measuredNodeSizes, sourceNodes]
  );

  useEffect(() => {
    const validNodeIds = new Set(sourceNodes.map((node) => node.id));

    setMeasuredNodeSizes((current) => {
      const nextEntries = Object.entries(current).filter(([nodeId]) => validNodeIds.has(nodeId));
      if (nextEntries.length === Object.keys(current).length) {
        return current;
      }

      return Object.fromEntries(nextEntries);
    });
  }, [sourceNodes]);

  const normalizedEdges = useMemo(
    () =>
      sourceEdges.map((edge) => ({
        ...edge,
        type: edge.type ?? config.defaultEdgeType,
      })),
    [config.defaultEdgeType, sourceEdges]
  );

  const {
    effectiveHighlightedNodeSet,
    effectiveHighlightedEdgeSet,
    visibleNodes,
    visibleEdges,
    childNodeIdsByParent,
  } = useGraphSearchState({
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

  const layoutOptions = useMemo(
    () => ({
      nodes: visibleNodes,
      edges: visibleEdges,
      theme: mergedTheme,
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
    }),
    [config, mergedTheme, visibleEdges, visibleNodes]
  );

  const handleNodeMeasure = useCallback(
    (nodeId: string, size: { width: number; height: number }) => {
      if (config.nodeSizing !== 'measured') {
        return;
      }

      setMeasuredNodeSizes((current) => {
        const previous = current[nodeId];
        if (previous && previous.width === size.width && previous.height === size.height) {
          return current;
        }

        return {
          ...current,
          [nodeId]: size,
        };
      });
    },
    [config.nodeSizing]
  );

  const positionedNodes: PositionedNode[] = useMemo(
    () => {
      if (!layoutNodesOverride) {
        return layoutNodes(layoutOptions);
      }

      try {
        return layoutNodesOverride(layoutOptions);
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error(String(error)), {
          graph,
          phase: 'layout-override',
        });
        return layoutNodes(layoutOptions);
      }
    },
    [graph, layoutNodesOverride, layoutOptions, onError]
  );

  const edgeRoutingOptions = useMemo(
    () => ({
      arrowPadding: config.arrowPadding,
      straight: !config.curveEdges || config.routingStyle === 'orthogonal',
      layoutDirection: config.layoutDirection,
      forceRightToLeft: config.forceRightToLeft,
      routingStyle: config.routingStyle,
      edgeSeparation: config.edgeSeparation,
      selfLoopRadius: config.selfLoopRadius,
    }),
    [config]
  );

  const positionedEdges: PositionedEdge[] = useMemo(
    () => {
      if (!routeEdgesOverride) {
        return routeEdges(positionedNodes, visibleEdges, edgeRoutingOptions);
      }

      try {
        return routeEdgesOverride(positionedNodes, visibleEdges, edgeRoutingOptions);
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error(String(error)), {
          graph,
          phase: 'routing-override',
        });
        return routeEdges(positionedNodes, visibleEdges, edgeRoutingOptions);
      }
    },
    [edgeRoutingOptions, graph, onError, positionedNodes, routeEdgesOverride, visibleEdges]
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
