import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EdgeType, LayoutType, Point } from '@graph-render/types';
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

const isFinitePoint = (point: Point | undefined): point is Point => {
  return Boolean(point && Number.isFinite(point.x) && Number.isFinite(point.y));
};

const validatePositionedNodes = (
  nodes: PositionedNode[],
  expectedNodes: NodeData[],
  source: 'layout' | 'layout override'
): void => {
  const expectedIds = new Set(expectedNodes.map((node) => node.id));

  if (nodes.length !== expectedNodes.length) {
    throw new Error(
      `${source} must return ${expectedNodes.length} nodes, received ${nodes.length}.`
    );
  }

  const seenIds = new Set<string>();
  nodes.forEach((node) => {
    if (!expectedIds.has(node.id)) {
      throw new Error(`${source} returned unknown node id "${node.id}".`);
    }
    if (seenIds.has(node.id)) {
      throw new Error(`${source} returned duplicate node id "${node.id}".`);
    }
    if (!isFinitePoint(node.position)) {
      throw new Error(`${source} returned a non-finite position for node "${node.id}".`);
    }
    seenIds.add(node.id);
  });
};

const validatePositionedEdges = (
  edges: PositionedEdge[],
  nodeIds: Set<string>,
  source: 'routing' | 'routing override'
): void => {
  const seenIds = new Set<string>();

  edges.forEach((edge) => {
    if (seenIds.has(edge.id)) {
      throw new Error(`${source} returned duplicate edge id "${edge.id}".`);
    }
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      throw new Error(
        `${source} returned edge "${edge.id}" with unknown endpoint(s): ${edge.source} -> ${edge.target}.`
      );
    }
    if (!Array.isArray(edge.points) || edge.points.length < 2) {
      throw new Error(`${source} returned edge "${edge.id}" without a valid point path.`);
    }
    edge.points.forEach((point, index) => {
      if (!isFinitePoint(point)) {
        throw new Error(
          `${source} returned a non-finite point at index ${index} for edge "${edge.id}".`
        );
      }
    });
    seenIds.add(edge.id);
  });
};

const toError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error(String(error));
};

const buildFallbackLayout = (layoutOptions: LayoutOptions): PositionedNode[] => {
  return layoutNodes({
    ...layoutOptions,
    layout: LayoutType.Centered,
  });
};

const buildFallbackEdges = (
  positionedNodes: PositionedNode[],
  edges: EdgeData[]
): PositionedEdge[] => {
  const nodeMap = new Map(positionedNodes.map((node) => [node.id, node]));

  return edges.flatMap((edge) => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);

    if (!source || !target) {
      return [];
    }

    const sourceWidth = source.size?.width ?? 0;
    const sourceHeight = source.size?.height ?? 0;
    const targetWidth = target.size?.width ?? 0;
    const targetHeight = target.size?.height ?? 0;

    if (source.id === target.id) {
      const right = source.position.x + sourceWidth;
      const top = source.position.y;
      return [
        {
          ...edge,
          type: edge.type ?? EdgeType.Directed,
          points: [
            {
              x: right - Math.min(sourceWidth * 0.25, 18),
              y: top + Math.min(sourceHeight * 0.35, 18),
            },
            { x: right + 28, y: top - 20 },
            { x: right + 36, y: top + sourceHeight / 2 },
            { x: right - Math.min(sourceWidth * 0.25, 18), y: top + sourceHeight * 0.8 },
          ],
        },
      ];
    }

    return [
      {
        ...edge,
        type: edge.type ?? EdgeType.Directed,
        points: [
          {
            x: source.position.x + sourceWidth / 2,
            y: source.position.y + sourceHeight / 2,
          },
          {
            x: target.position.x + targetWidth / 2,
            y: target.position.y + targetHeight / 2,
          },
        ],
      },
    ];
  });
};

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
  /**
   * Called whenever an internal layout or routing step throws.
   * - `'layout'`          — the default `layoutNodes` threw
   * - `'layout-override'` — a `layoutNodesOverride` threw (default was used as fallback)
   * - `'routing'`         — the default `routeEdges` threw
   * - `'routing-override'`— a `routeEdgesOverride` threw (default was used as fallback)
   */
  onError?: (
    error: Error,
    context: {
      graph: NxGraphInput;
      phase: 'layout' | 'layout-override' | 'routing' | 'routing-override';
    }
  ) => void;
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
    () =>
      fromTypedNxGraph(graph, config.defaultEdgeType, {
        inputValidationMode: config.inputValidationMode,
      }),
    [config.defaultEdgeType, config.inputValidationMode, graph]
  );

  const allowDegradedGraph = config.failureBehavior === 'degrade';

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

  const positionedNodes: PositionedNode[] = useMemo(() => {
    if (!layoutNodesOverride) {
      try {
        const laidOutNodes = layoutNodes(layoutOptions);
        validatePositionedNodes(laidOutNodes, visibleNodes, 'layout');
        return laidOutNodes;
      } catch (error) {
        onError?.(toError(error), {
          graph,
          phase: 'layout',
        });

        if (!allowDegradedGraph) {
          throw toError(error);
        }

        try {
          const fallbackNodes = buildFallbackLayout(layoutOptions);
          validatePositionedNodes(fallbackNodes, visibleNodes, 'layout');
          return fallbackNodes;
        } catch (fallbackError) {
          const normalizedFallbackError = toError(fallbackError);
          onError?.(normalizedFallbackError, {
            graph,
            phase: 'layout',
          });
          throw normalizedFallbackError;
        }
      }
    }

    try {
      const overrideNodes = layoutNodesOverride(layoutOptions);
      validatePositionedNodes(overrideNodes, visibleNodes, 'layout override');
      return overrideNodes;
    } catch (error) {
      onError?.(toError(error), {
        graph,
        phase: 'layout-override',
      });

      if (!allowDegradedGraph) {
        throw toError(error);
      }

      try {
        const fallbackNodes = layoutNodes(layoutOptions);
        validatePositionedNodes(fallbackNodes, visibleNodes, 'layout');
        return fallbackNodes;
      } catch (fallbackError) {
        onError?.(toError(fallbackError), { graph, phase: 'layout' });

        try {
          const finalFallbackNodes = buildFallbackLayout(layoutOptions);
          validatePositionedNodes(finalFallbackNodes, visibleNodes, 'layout');
          return finalFallbackNodes;
        } catch (finalFallbackError) {
          const normalizedFinalFallbackError = toError(finalFallbackError);
          onError?.(normalizedFinalFallbackError, { graph, phase: 'layout' });
          throw normalizedFinalFallbackError;
        }
      }
    }
  }, [graph, layoutNodesOverride, layoutOptions, onError, visibleNodes]);

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

  const positionedEdges: PositionedEdge[] = useMemo(() => {
    const nodeIds = new Set(positionedNodes.map((node) => node.id));

    if (!routeEdgesOverride) {
      try {
        const routedEdges = routeEdges(positionedNodes, visibleEdges, edgeRoutingOptions);
        validatePositionedEdges(routedEdges, nodeIds, 'routing');
        return routedEdges;
      } catch (error) {
        onError?.(toError(error), {
          graph,
          phase: 'routing',
        });
        if (!allowDegradedGraph) {
          throw toError(error);
        }
        const fallbackEdges = buildFallbackEdges(positionedNodes, visibleEdges);
        validatePositionedEdges(fallbackEdges, nodeIds, 'routing');
        return fallbackEdges;
      }
    }

    try {
      const overrideEdges = routeEdgesOverride(positionedNodes, visibleEdges, edgeRoutingOptions);
      validatePositionedEdges(overrideEdges, nodeIds, 'routing override');
      return overrideEdges;
    } catch (error) {
      onError?.(toError(error), {
        graph,
        phase: 'routing-override',
      });

      if (!allowDegradedGraph) {
        throw toError(error);
      }

      try {
        const fallbackEdges = routeEdges(positionedNodes, visibleEdges, edgeRoutingOptions);
        validatePositionedEdges(fallbackEdges, nodeIds, 'routing');
        return fallbackEdges;
      } catch (fallbackError) {
        onError?.(toError(fallbackError), { graph, phase: 'routing' });
        const finalFallbackEdges = buildFallbackEdges(positionedNodes, visibleEdges);
        validatePositionedEdges(finalFallbackEdges, nodeIds, 'routing');
        return finalFallbackEdges;
      }
    }
  }, [
    edgeRoutingOptions,
    graph,
    onError,
    allowDegradedGraph,
    positionedNodes,
    routeEdgesOverride,
    visibleEdges,
  ]);

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
