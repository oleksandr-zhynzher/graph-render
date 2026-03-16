import React, {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DEFAULT_THEME, normalizeGraphConfig } from '@graph-render/core';
import {
  DragState,
  EdgeData,
  GraphControlsPosition,
  GraphHandle,
  GraphProps,
  GraphRenderContext,
  GraphSelection,
  GraphViewport,
  LayoutDirection,
  LayoutType,
  NodeData,
  NxGraphInput,
  PositionedEdge,
  PositionedNode,
} from '@graph-render/types';
import { useGraphHover } from '../hooks/useGraphHover';
import { useGraphModel } from '../hooks/useGraphModel';
import { useStableConfig } from '../hooks/useStableConfig';
import {
  GraphBounds,
  centerViewportOnNode,
  clampZoom,
  getFitViewport,
  getGraphBounds,
} from '../utils/viewport';
import { EdgePath } from './EdgePath';
import {
  getEffectiveGraphLabels,
  getLabelPillWidth,
  GraphLabels,
  LABEL_PILL_HEIGHT,
} from './GraphLabels';
import { GraphNode } from './GraphNode';

const DEFAULT_VIEWPORT: GraphViewport = { x: 0, y: 0, zoom: 1 };
const DEFAULT_SELECTION: GraphSelection = { nodeIds: [], edgeIds: [] };
const DEFAULT_MIN_ZOOM = 0.25;
const DEFAULT_MAX_ZOOM = 2.5;
const DEFAULT_ZOOM_STEP = 0.12;
const DEFAULT_SELECTION_COLOR = '#f59e0b';
const DEFAULT_CONTROLS_POSITION: GraphControlsPosition = 'top-left';
const CONTROL_BUTTON_SIZE = 26;
// Width used for the two wider label buttons ('Fit', '1:1').
const CONTROL_LABEL_BUTTON_WIDTH = 34;
const CONTROL_BUTTON_GAP = 8;
const EDGE_LABEL_WIDTH = 48;
const EDGE_LABEL_HEIGHT = 20;
const FIT_BOUNDS_MARGIN = 8;

type PointerState = { x: number; y: number };
type PinchState = {
  active: boolean;
  startDistance: number;
  startZoom: number;
  worldX: number;
  worldY: number;
};
type SelectionBox = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

const normalizeViewport = (
  viewport: GraphViewport,
  minZoom: number,
  maxZoom: number
): GraphViewport => ({
  x: Number.isFinite(viewport.x) ? viewport.x : 0,
  y: Number.isFinite(viewport.y) ? viewport.y : 0,
  zoom: clampZoom(Number.isFinite(viewport.zoom) ? viewport.zoom : 1, minZoom, maxZoom),
});

const normalizeZoomRange = (
  minZoom: number,
  maxZoom: number
): { minZoom: number; maxZoom: number } => {
  const safeMinZoom = Number.isFinite(minZoom) && minZoom > 0 ? minZoom : DEFAULT_MIN_ZOOM;
  const safeMaxZoom = Number.isFinite(maxZoom) && maxZoom > 0 ? maxZoom : DEFAULT_MAX_ZOOM;

  return safeMinZoom <= safeMaxZoom
    ? { minZoom: safeMinZoom, maxZoom: safeMaxZoom }
    : { minZoom: safeMaxZoom, maxZoom: safeMinZoom };
};

const toggleId = (values: string[], id: string, selectionMode: 'single' | 'multiple'): string[] => {
  if (selectionMode === 'single') {
    return values.length === 1 && values[0] === id ? [] : [id];
  }

  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
};

const getControlPosition = (
  width: number,
  height: number,
  position: GraphControlsPosition
): { x: number; y: number } => {
  // Total width of the 4 control buttons (2 × icon buttons + 2 × label buttons)
  // plus the 3 gaps between them. Keep in sync with the button widths in
  // viewportControls; if a button is added/removed this must be updated too.
  const controlsWidth =
    2 * CONTROL_BUTTON_SIZE + 2 * CONTROL_LABEL_BUTTON_WIDTH + CONTROL_BUTTON_GAP * 3;
  const inset = 12;

  switch (position) {
    case 'top-right':
      return { x: width - controlsWidth - inset, y: inset };
    case 'bottom-left':
      return { x: inset, y: height - CONTROL_BUTTON_SIZE - inset };
    case 'bottom-right':
      return {
        x: width - controlsWidth - inset,
        y: height - CONTROL_BUTTON_SIZE - inset,
      };
    case 'top-left':
    default:
      return { x: inset, y: inset };
  }
};

const getPointerDistance = (a: PointerState, b: PointerState): number => {
  return Math.hypot(a.x - b.x, a.y - b.y);
};

const getPointerMidpoint = (a: PointerState, b: PointerState): PointerState => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

const normalizeRect = (box: SelectionBox) => ({
  x: Math.min(box.startX, box.endX),
  y: Math.min(box.startY, box.endY),
  width: Math.abs(box.endX - box.startX),
  height: Math.abs(box.endY - box.startY),
});

const isPointInsideRect = (
  x: number,
  y: number,
  rect: { x: number; y: number; width: number; height: number }
): boolean => {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
};

const expandBounds = (bounds: GraphBounds, margin: number): GraphBounds => ({
  minX: bounds.minX - margin,
  minY: bounds.minY - margin,
  maxX: bounds.maxX + margin,
  maxY: bounds.maxY + margin,
  width: bounds.width + margin * 2,
  height: bounds.height + margin * 2,
});

const mergeBounds = (base: GraphBounds | null, next: GraphBounds | null): GraphBounds | null => {
  if (!base) {
    return next;
  }

  if (!next) {
    return base;
  }

  const minX = Math.min(base.minX, next.minX);
  const minY = Math.min(base.minY, next.minY);
  const maxX = Math.max(base.maxX, next.maxX);
  const maxY = Math.max(base.maxY, next.maxY);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const getLabelBounds = (
  nodes: PositionedNode[],
  layout: LayoutType,
  layoutDirection: LayoutDirection,
  labels: string[] | undefined,
  autoLabels: boolean,
  labelOffset: number
): GraphBounds | null => {
  if (!nodes.length || (!autoLabels && !(labels && labels.length))) {
    return null;
  }

  const columns = new Map<number, PositionedNode[]>();
  nodes.forEach((node) => {
    const column = columns.get(node.position.x) ?? [];
    column.push(node);
    columns.set(node.position.x, column);
  });

  const xs = Array.from(columns.keys()).sort((a, b) => a - b);
  if (!xs.length) {
    return null;
  }

  const orderedXs =
    layout === LayoutType.Tree && layoutDirection === LayoutDirection.RTL ? [...xs].reverse() : xs;
  const { orderedLabels } = getEffectiveGraphLabels(
    nodes,
    layout,
    layoutDirection,
    labels,
    autoLabels
  );
  const minY = Math.min(...nodes.map((node) => node.position.y));
  const topY = minY - labelOffset - LABEL_PILL_HEIGHT + 6;

  return orderedXs.reduce<GraphBounds | null>((bounds, x, index) => {
    const nodeWidth = columns.get(x)?.[0]?.size?.width ?? 0;
    const centerX = x + nodeWidth / 2;
    const labelWidth = getLabelPillWidth(orderedLabels[index] ?? '');
    const labelBounds: GraphBounds = {
      minX: centerX - labelWidth / 2,
      minY: topY,
      maxX: centerX + labelWidth / 2,
      maxY: topY + LABEL_PILL_HEIGHT,
      width: labelWidth,
      height: LABEL_PILL_HEIGHT,
    };

    return mergeBounds(bounds, labelBounds);
  }, null);
};

const getEdgeLabelBounds = (edges: PositionedEdge[]): GraphBounds | null => {
  return edges.reduce<GraphBounds | null>((bounds, edge) => {
    if (!edge.labelPosition) {
      return bounds;
    }

    const labelBounds: GraphBounds = {
      minX: edge.labelPosition.x - EDGE_LABEL_WIDTH / 2,
      minY: edge.labelPosition.y - EDGE_LABEL_HEIGHT / 2,
      maxX: edge.labelPosition.x + EDGE_LABEL_WIDTH / 2,
      maxY: edge.labelPosition.y + EDGE_LABEL_HEIGHT / 2,
      width: EDGE_LABEL_WIDTH,
      height: EDGE_LABEL_HEIGHT,
    };

    return mergeBounds(bounds, labelBounds);
  }, null);
};

const getRelativeSvgPoint = (
  svg: SVGSVGElement | null,
  clientX: number,
  clientY: number
): PointerState => {
  if (!svg) {
    return { x: clientX, y: clientY };
  }

  const rect = svg.getBoundingClientRect();
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
};

const getNearestNodeInDirection = (
  currentNode: PositionedNode,
  nodes: PositionedNode[],
  direction: 'left' | 'right' | 'up' | 'down'
): PositionedNode | null => {
  const currentCenter = {
    x: currentNode.position.x + (currentNode.size?.width ?? 0) / 2,
    y: currentNode.position.y + (currentNode.size?.height ?? 0) / 2,
  };

  const candidates = nodes.filter((node) => {
    if (node.id === currentNode.id) {
      return false;
    }

    const center = {
      x: node.position.x + (node.size?.width ?? 0) / 2,
      y: node.position.y + (node.size?.height ?? 0) / 2,
    };

    if (direction === 'left') {
      return center.x < currentCenter.x;
    }
    if (direction === 'right') {
      return center.x > currentCenter.x;
    }
    if (direction === 'up') {
      return center.y < currentCenter.y;
    }
    return center.y > currentCenter.y;
  });

  if (!candidates.length) {
    return null;
  }

  // Linear scan (O(n)) to find the closest candidate.
  // Sorting the full array is O(n log n) and wasteful since we only need the minimum.
  let nearest = candidates[0];
  let nearestDistance = Math.hypot(
    nearest.position.x + (nearest.size?.width ?? 0) / 2 - currentCenter.x,
    nearest.position.y + (nearest.size?.height ?? 0) / 2 - currentCenter.y
  );

  for (let i = 1; i < candidates.length; i++) {
    const node = candidates[i];
    const d = Math.hypot(
      node.position.x + (node.size?.width ?? 0) / 2 - currentCenter.x,
      node.position.y + (node.size?.height ?? 0) / 2 - currentCenter.y
    );
    if (d < nearestDistance) {
      nearest = node;
      nearestDistance = d;
    }
  }

  return nearest;
};

const GraphInner = (
  {
    graph,
    vertexComponent: Vertex,
    edgeComponent: EdgeComponent = EdgePath,
    config,
    viewport: controlledViewport,
    defaultViewport,
    onViewportChange,
    fitViewOnMount = false,
    fitViewPadding = 32,
    minZoom = DEFAULT_MIN_ZOOM,
    maxZoom = DEFAULT_MAX_ZOOM,
    zoomStep = DEFAULT_ZOOM_STEP,
    panEnabled = true,
    zoomEnabled = true,
    pinchZoomEnabled = true,
    keyboardNavigation = true,
    showControls = false,
    controlsPosition = DEFAULT_CONTROLS_POSITION,
    marqueeSelectionEnabled = true,
    focusedNodeId: controlledFocusedNodeId,
    defaultFocusedNodeId = null,
    onFocusedNodeChange,
    collapsedNodeIds,
    defaultCollapsedNodeIds,
    onCollapsedNodeIdsChange,
    toggleCollapseOnNodeDoubleClick = true,
    hiddenNodeIds,
    onNodeExpand,
    onNodeCollapse,
    searchQuery,
    hideUnmatchedSearch = false,
    searchPredicate,
    highlightedNodeIds,
    highlightedEdgeIds,
    highlightColor = '#f59e0b',
    highlightStrategy,
    onSearchResultsChange,
    selectedNodeIds,
    selectedEdgeIds,
    defaultSelectedNodeIds,
    defaultSelectedEdgeIds,
    onSelectionChange,
    selectionMode = 'single',
    nodeSelectionEnabled = true,
    edgeSelectionEnabled = true,
    selectionColor = DEFAULT_SELECTION_COLOR,
    edgeSelectionColor,
    layoutNodesOverride,
    routeEdgesOverride,
    renderBackground,
    renderOverlay,
    onNodeHoverChange,
    onEdgeHoverChange,
    onNodeClick,
    onEdgeClick,
  }: GraphProps<any, any, any, any, any>,
  ref: React.ForwardedRef<GraphHandle>
) => {
  const zoomRange = useMemo(() => normalizeZoomRange(minZoom, maxZoom), [minZoom, maxZoom]);
  const safeMinZoom = zoomRange.minZoom;
  const safeMaxZoom = zoomRange.maxZoom;
  // Stabilize the config reference so that inline object literals passed by
  // consumers do not cascade a full model recompute on every parent render.
  const stableConfig = useStableConfig(config);
  const markerPrefix = useId().replace(/:/g, '-');
  const [internalViewport, setInternalViewport] = useState<GraphViewport>(() =>
    normalizeViewport({ ...DEFAULT_VIEWPORT, ...(defaultViewport ?? {}) }, safeMinZoom, safeMaxZoom)
  );
  const [internalSelection, setInternalSelection] = useState<GraphSelection>({
    nodeIds: defaultSelectedNodeIds ?? [],
    edgeIds: defaultSelectedEdgeIds ?? [],
  });
  const [internalFocusedNodeId, setInternalFocusedNodeId] = useState<string | null>(
    defaultFocusedNodeId
  );
  const [internalCollapsedNodeIds, setInternalCollapsedNodeIds] = useState<string[]>(
    defaultCollapsedNodeIds ?? []
  );
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<DragState>({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  const activePointersRef = useRef<Map<number, PointerState>>(new Map());
  const pinchRef = useRef<PinchState>({
    active: false,
    startDistance: 0,
    startZoom: 1,
    worldX: 0,
    worldY: 0,
  });
  const svgRef = useRef<SVGSVGElement>(null);
  const contentRef = useRef<SVGGElement>(null);
  const hasAppliedInitialFitViewRef = useRef(false);

  const cfg = useMemo(() => normalizeGraphConfig(stableConfig), [stableConfig]);
  const mergedTheme = cfg.theme;
  const edgeColor = mergedTheme.edgeColor ?? DEFAULT_THEME.edgeColor;
  const edgeWidth = mergedTheme.edgeWidth ?? DEFAULT_THEME.edgeWidth;
  const selectionEdgeColor = edgeSelectionColor ?? selectionColor;
  // These are simple nullish-coalescing expressions on string primitives.
  // Wrapping them in useMemo adds hook overhead that costs more than the
  // expression itself, and the parent cfg is already memoized so updates
  // are gated there.
  const hoverNodeBorderColor = cfg.hoverNodeBorderColor ?? cfg.hoverEdgeColor;
  const hoverNodeBothColor = cfg.hoverNodeBothColor ?? cfg.hoverEdgeColor;
  const nodeBorderColor = mergedTheme.nodeBorderColor;
  const nodeBorderWidth = mergedTheme.nodeBorderWidth ?? 0;
  const showArrows = cfg.showArrows;
  const arrowMarkerId = `${markerPrefix}-arrow`;
  const hoverArrowMarkerId = `${markerPrefix}-arrow-hover`;
  const hoverIncomingArrowMarkerId = `${markerPrefix}-arrow-hover-in`;
  const selectionArrowMarkerId = `${markerPrefix}-arrow-selected`;

  const viewport = useMemo(
    () => normalizeViewport(controlledViewport ?? internalViewport, safeMinZoom, safeMaxZoom),
    [controlledViewport, internalViewport, safeMaxZoom, safeMinZoom]
  );
  // Always keep a ref in sync so gesture handlers can read the latest value
  // without closing over the rendered snapshot (avoids dropped events on rapid input).
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;
  const selection = useMemo<GraphSelection>(
    () => ({
      nodeIds: selectedNodeIds ?? internalSelection.nodeIds,
      edgeIds: selectedEdgeIds ?? internalSelection.edgeIds,
    }),
    [selectedNodeIds, selectedEdgeIds, internalSelection]
  );
  const focusedNodeId =
    controlledFocusedNodeId !== undefined ? controlledFocusedNodeId : internalFocusedNodeId;
  const collapsedIds = collapsedNodeIds ?? internalCollapsedNodeIds;
  const selectedNodeSet = useMemo(() => new Set(selection.nodeIds), [selection.nodeIds]);
  const selectedEdgeSet = useMemo(() => new Set(selection.edgeIds), [selection.edgeIds]);

  const updateViewport = useCallback(
    (
      next:
        | Partial<GraphViewport>
        | ((current: GraphViewport) => Partial<GraphViewport> | GraphViewport)
    ) => {
      // Read the latest viewport from the ref so that rapid-fire events
      // (wheel, pinch) always compute their delta from the current state
      // rather than a stale closure snapshot.
      const current = viewportRef.current;
      const resolved = typeof next === 'function' ? next(current) : next;
      const normalized = normalizeViewport({ ...current, ...resolved }, safeMinZoom, safeMaxZoom);

      if (!controlledViewport) {
        setInternalViewport(normalized);
      }
      onViewportChangeRef.current?.(normalized);
      return normalized;
    },
    // viewport and onViewportChange are intentionally excluded: both are read
    // via refs so the callback stays stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [controlledViewport, safeMaxZoom, safeMinZoom]
  );

  const updateSelection = useCallback(
    (next: GraphSelection | ((current: GraphSelection) => GraphSelection)) => {
      const resolved = typeof next === 'function' ? next(selection) : next;
      if (selectedNodeIds == null || selectedEdgeIds == null) {
        setInternalSelection((current) => ({
          nodeIds: selectedNodeIds == null ? resolved.nodeIds : current.nodeIds,
          edgeIds: selectedEdgeIds == null ? resolved.edgeIds : current.edgeIds,
        }));
      }
      onSelectionChange?.(resolved);
    },
    [onSelectionChange, selectedEdgeIds, selectedNodeIds, selection]
  );

  const updateFocusedNode = useCallback(
    (nodeId: string | null) => {
      if (controlledFocusedNodeId === undefined) {
        setInternalFocusedNodeId(nodeId);
      }
      onFocusedNodeChange?.(nodeId);
    },
    [controlledFocusedNodeId, onFocusedNodeChange]
  );

  const updateCollapsedNodeIds = useCallback(
    (next: string[] | ((current: string[]) => string[])) => {
      const resolved = typeof next === 'function' ? next(collapsedIds) : next;
      if (collapsedNodeIds == null) {
        setInternalCollapsedNodeIds(resolved);
      }
      onCollapsedNodeIdsChange?.(resolved);
    },
    [collapsedIds, collapsedNodeIds, onCollapsedNodeIdsChange]
  );
  const collapsedNodeSet = useMemo(() => new Set(collapsedIds), [collapsedIds]);
  const {
    childNodeIdsByParent,
    effectiveHighlightedEdgeSet,
    effectiveHighlightedNodeSet,
    handleNodeMeasure,
    positionedEdges,
    positionedNodes,
    visibleEdges,
    visibleNodesWithMeasuredSize,
  } = useGraphModel({
    graph,
    config: cfg,
    mergedTheme,
    collapsedIds,
    hiddenNodeIds,
    searchQuery,
    hideUnmatchedSearch,
    searchPredicate,
    highlightedNodeIds,
    highlightedEdgeIds,
    highlightStrategy,
    onSearchResultsChange,
    layoutNodesOverride,
    routeEdgesOverride,
  });

  useEffect(() => {
    const visibleNodeIds = new Set(visibleNodesWithMeasuredSize.map((node) => node.id));
    const visibleEdgeIds = new Set(visibleEdges.map((edge) => edge.id));

    if (
      selection.nodeIds.some((nodeId) => !visibleNodeIds.has(nodeId)) ||
      selection.edgeIds.some((edgeId) => !visibleEdgeIds.has(edgeId))
    ) {
      updateSelection({
        nodeIds: selection.nodeIds.filter((nodeId) => visibleNodeIds.has(nodeId)),
        edgeIds: selection.edgeIds.filter((edgeId) => visibleEdgeIds.has(edgeId)),
      });
    }

    if (focusedNodeId && !visibleNodeIds.has(focusedNodeId)) {
      updateFocusedNode(null);
    }
  }, [
    focusedNodeId,
    selection,
    updateFocusedNode,
    updateSelection,
    visibleEdges,
    visibleNodesWithMeasuredSize,
  ]);

  const graphBounds = useMemo(() => getGraphBounds(positionedNodes), [positionedNodes]);
  const contentBounds = useMemo(() => {
    const bounds = mergeBounds(
      mergeBounds(
        graphBounds,
        getLabelBounds(
          positionedNodes,
          cfg.layout,
          cfg.layoutDirection,
          cfg.labels,
          cfg.autoLabels,
          cfg.labelOffset
        )
      ),
      getEdgeLabelBounds(positionedEdges)
    );

    return bounds ? expandBounds(bounds, FIT_BOUNDS_MARGIN) : bounds;
  }, [
    cfg.autoLabels,
    cfg.labelOffset,
    cfg.labels,
    cfg.layout,
    cfg.layoutDirection,
    graphBounds,
    positionedEdges,
    positionedNodes,
  ]);

  const getViewportDimensions = useCallback(() => {
    const svgElement = svgRef.current;
    if (!svgElement) {
      return { width: cfg.width, height: cfg.height };
    }

    const containerRect = svgElement.parentElement?.getBoundingClientRect();
    const rect = containerRect ?? svgElement.getBoundingClientRect();
    return {
      width: rect.width || cfg.width,
      height: rect.height || cfg.height,
    };
  }, [cfg.height, cfg.width]);

  const fitView = useCallback(
    (padding: number = fitViewPadding) => {
      const { width, height } = getViewportDimensions();
      updateViewport(
        getFitViewport(contentBounds, width, height, padding, safeMinZoom, safeMaxZoom)
      );
    },
    [contentBounds, fitViewPadding, getViewportDimensions, safeMaxZoom, safeMinZoom, updateViewport]
  );

  const centerOnNode = useCallback(
    (nodeId: string) => {
      const node = positionedNodes.find((entry) => entry.id === nodeId);
      if (!node) {
        return;
      }

      const { width, height } = getViewportDimensions();
      updateViewport(centerViewportOnNode(node, width, height, viewport.zoom));
    },
    [getViewportDimensions, positionedNodes, updateViewport, viewport.zoom]
  );

  useImperativeHandle(
    ref,
    () => ({
      fitView,
      centerOnNode,
      zoomIn: () => updateViewport((current) => ({ zoom: current.zoom + zoomStep })),
      zoomOut: () => updateViewport((current) => ({ zoom: current.zoom - zoomStep })),
      zoomTo: (zoom: number) => updateViewport({ zoom }),
      resetViewport: () => updateViewport(DEFAULT_VIEWPORT),
      getViewport: () => viewport,
      setViewport: updateViewport,
      clearSelection: () => updateSelection(DEFAULT_SELECTION),
    }),
    [centerOnNode, fitView, updateSelection, updateViewport, viewport, zoomStep]
  );

  useEffect(() => {
    hasAppliedInitialFitViewRef.current = false;
  }, [graph]);

  useEffect(() => {
    if (!fitViewOnMount || hasAppliedInitialFitViewRef.current || positionedNodes.length === 0) {
      return;
    }

    hasAppliedInitialFitViewRef.current = true;
    fitView();
  }, [fitView, fitViewOnMount, positionedNodes.length]);

  const {
    hoveredEdgeId,
    setHoveredEdgeId,
    hoveredNodeId,
    setHoveredNodeId,
    focusedPath,
    setFocusedPath,
    pathHighlight,
    hoveredNodeStates,
    edgesForRender,
  } = useGraphHover(positionedNodes, positionedEdges, cfg.hoverHighlight);

  const renderContext = useMemo<GraphRenderContext>(
    () => ({
      graph,
      nodes: positionedNodes,
      edges: positionedEdges,
      config: cfg,
      viewport,
      selection,
    }),
    [cfg, graph, positionedEdges, positionedNodes, selection, viewport]
  );

  const emitNodeHover = useCallback(
    (node: PositionedNode, hovered: boolean, trigger: 'pointer' | 'path' = 'pointer') => {
      onNodeHoverChange?.(node, hovered, {
        viewport,
        selection,
        trigger,
      });
    },
    [onNodeHoverChange, selection, viewport]
  );

  const emitEdgeHover = useCallback(
    (edge: PositionedEdge, hovered: boolean, trigger: 'pointer' | 'path' = 'pointer') => {
      onEdgeHoverChange?.(edge, hovered, {
        viewport,
        selection,
        trigger,
      });
    },
    [onEdgeHoverChange, selection, viewport]
  );

  const handleNodeSelection = useCallback(
    (node: PositionedNode) => {
      if (!nodeSelectionEnabled) {
        updateFocusedNode(node.id);
        onNodeClick?.(node);
        return;
      }

      updateSelection((current) => ({
        nodeIds: toggleId(current.nodeIds, node.id, selectionMode),
        edgeIds: selectionMode === 'single' ? [] : current.edgeIds,
      }));
      updateFocusedNode(node.id);
      onNodeClick?.(node);
    },
    [nodeSelectionEnabled, onNodeClick, selectionMode, updateFocusedNode, updateSelection]
  );

  const handleNodeDoubleClick = useCallback(
    (node: PositionedNode) => {
      if (!toggleCollapseOnNodeDoubleClick) {
        return;
      }

      const hasChildren = (childNodeIdsByParent.get(node.id) ?? []).length > 0;
      if (!hasChildren) {
        return;
      }

      if (collapsedNodeSet.has(node.id)) {
        updateCollapsedNodeIds((current) => current.filter((id) => id !== node.id));
        onNodeExpand?.(node.id);
      } else {
        updateCollapsedNodeIds((current) => [...current, node.id]);
        onNodeCollapse?.(node.id);
      }
    },
    [
      childNodeIdsByParent,
      collapsedNodeSet,
      onNodeCollapse,
      onNodeExpand,
      toggleCollapseOnNodeDoubleClick,
      updateCollapsedNodeIds,
    ]
  );

  const handleEdgeSelection = useCallback(
    (edge: PositionedEdge) => {
      if (!edgeSelectionEnabled) {
        onEdgeClick?.(edge);
        return;
      }

      updateSelection((current) => ({
        nodeIds: selectionMode === 'single' ? [] : current.nodeIds,
        edgeIds: toggleId(current.edgeIds, edge.id, selectionMode),
      }));
      onEdgeClick?.(edge);
    },
    [edgeSelectionEnabled, onEdgeClick, selectionMode, updateSelection]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const target = event.target as Element;
      const isInteractiveTarget = Boolean(
        target.closest('[data-graph-node-interactive="true"], [data-graph-edge-interactive="true"]')
      );
      const relativePoint = getRelativeSvgPoint(svgRef.current, event.clientX, event.clientY);

      if (
        !isInteractiveTarget &&
        selectionMode === 'multiple' &&
        marqueeSelectionEnabled &&
        event.shiftKey
      ) {
        setSelectionBox({
          startX: relativePoint.x,
          startY: relativePoint.y,
          endX: relativePoint.x,
          endY: relativePoint.y,
        });
        dragRef.current.active = false;
        return;
      }

      if (event.pointerType === 'touch') {
        activePointersRef.current.set(event.pointerId, relativePoint);
        if (pinchZoomEnabled && zoomEnabled && activePointersRef.current.size === 2) {
          const [first, second] = Array.from(activePointersRef.current.values());
          const midpoint = getPointerMidpoint(first, second);
          pinchRef.current = {
            active: true,
            startDistance: getPointerDistance(first, second),
            startZoom: viewport.zoom,
            worldX: (midpoint.x - viewport.x) / viewport.zoom,
            worldY: (midpoint.y - viewport.y) / viewport.zoom,
          };
          dragRef.current.active = false;
          target.setPointerCapture?.(event.pointerId);
          return;
        }
      }

      if (!panEnabled || event.button !== 0 || isInteractiveTarget) {
        return;
      }

      dragRef.current = {
        active: true,
        startX: relativePoint.x,
        startY: relativePoint.y,
        originX: viewport.x,
        originY: viewport.y,
      };
      setIsDragging(true);
      target.setPointerCapture?.(event.pointerId);
    },
    [marqueeSelectionEnabled, panEnabled, pinchZoomEnabled, selectionMode, viewport, zoomEnabled]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const relativePoint = getRelativeSvgPoint(svgRef.current, event.clientX, event.clientY);

      if (event.pointerType === 'touch' && activePointersRef.current.has(event.pointerId)) {
        activePointersRef.current.set(event.pointerId, relativePoint);

        if (pinchRef.current.active && activePointersRef.current.size >= 2) {
          const [first, second] = Array.from(activePointersRef.current.values());
          const midpoint = getPointerMidpoint(first, second);
          const distance = getPointerDistance(first, second);
          const nextZoom = clampZoom(
            pinchRef.current.startZoom * (distance / Math.max(1, pinchRef.current.startDistance)),
            safeMinZoom,
            safeMaxZoom
          );

          updateViewport({
            zoom: nextZoom,
            x: midpoint.x - pinchRef.current.worldX * nextZoom,
            y: midpoint.y - pinchRef.current.worldY * nextZoom,
          });
          return;
        }
      }

      if (selectionBox) {
        setSelectionBox((current) =>
          current
            ? {
                ...current,
                endX: relativePoint.x,
                endY: relativePoint.y,
              }
            : current
        );
        return;
      }

      if (!panEnabled || !dragRef.current.active) {
        return;
      }

      updateViewport({
        x: dragRef.current.originX + (relativePoint.x - dragRef.current.startX),
        y: dragRef.current.originY + (relativePoint.y - dragRef.current.startY),
      });
    },
    [panEnabled, safeMaxZoom, safeMinZoom, selectionBox, updateViewport]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      activePointersRef.current.delete(event.pointerId);
      if (activePointersRef.current.size < 2) {
        pinchRef.current.active = false;
      }

      if (selectionBox) {
        const box = normalizeRect(selectionBox);
        const worldRect = {
          x: (box.x - viewport.x) / viewport.zoom,
          y: (box.y - viewport.y) / viewport.zoom,
          width: box.width / viewport.zoom,
          height: box.height / viewport.zoom,
        };

        const nodeIds = positionedNodes
          .filter((node) => {
            const width = node.size?.width ?? 0;
            const height = node.size?.height ?? 0;
            return !(
              node.position.x + width < worldRect.x ||
              node.position.x > worldRect.x + worldRect.width ||
              node.position.y + height < worldRect.y ||
              node.position.y > worldRect.y + worldRect.height
            );
          })
          .map((node) => node.id);

        const edgeIds = positionedEdges
          .filter((edge) => {
            // An edge is inside the marquee if ANY of its path points OR its
            // label centre falls within the world rect.  The previous code
            // tested only the label when labelPosition was present, which
            // meant dragging across an edge path would miss it if the label
            // happened to be outside the selection box.
            const inPoints = edge.points.some((point) =>
              isPointInsideRect(point.x, point.y, worldRect)
            );
            const inLabel =
              !!edge.labelPosition &&
              isPointInsideRect(edge.labelPosition.x, edge.labelPosition.y, worldRect);
            return inPoints || inLabel;
          })
          .map((edge) => edge.id);

        updateSelection((current) => ({
          nodeIds: Array.from(new Set([...current.nodeIds, ...nodeIds])),
          edgeIds: Array.from(new Set([...current.edgeIds, ...edgeIds])),
        }));
        setSelectionBox(null);
      }

      dragRef.current.active = false;
      setIsDragging(false);
      (event.target as Element).releasePointerCapture?.(event.pointerId);
    },
    [positionedEdges, positionedNodes, selectionBox, updateSelection, viewport]
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent<SVGSVGElement>) => {
      if (!zoomEnabled || !svgRef.current) {
        return;
      }

      event.preventDefault();
      const pointer = getRelativeSvgPoint(svgRef.current, event.clientX, event.clientY);
      const worldX = (pointer.x - viewport.x) / viewport.zoom;
      const worldY = (pointer.y - viewport.y) / viewport.zoom;
      const nextZoom = clampZoom(
        viewport.zoom + (event.deltaY < 0 ? zoomStep : -zoomStep),
        safeMinZoom,
        safeMaxZoom
      );

      updateViewport({
        zoom: nextZoom,
        x: pointer.x - worldX * nextZoom,
        y: pointer.y - worldY * nextZoom,
      });
    },
    [safeMaxZoom, safeMinZoom, updateViewport, viewport, zoomEnabled, zoomStep]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<SVGSVGElement>) => {
      if (!keyboardNavigation) {
        return;
      }

      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault();
          updateViewport((current) => ({ zoom: current.zoom + zoomStep }));
          break;
        case '-':
        case '_':
          event.preventDefault();
          updateViewport((current) => ({ zoom: current.zoom - zoomStep }));
          break;
        case '0':
          event.preventDefault();
          fitView();
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown': {
          event.preventDefault();
          if (focusedNodeId) {
            const currentNode = positionedNodes.find((node) => node.id === focusedNodeId);
            if (currentNode) {
              const direction =
                event.key === 'ArrowLeft'
                  ? 'left'
                  : event.key === 'ArrowRight'
                    ? 'right'
                    : event.key === 'ArrowUp'
                      ? 'up'
                      : 'down';
              const nextNode = getNearestNodeInDirection(currentNode, positionedNodes, direction);
              if (nextNode) {
                updateFocusedNode(nextNode.id);
                // Pan the viewport so the newly focused node is visible.
                // Without this the user can arrow-navigate off-screen.
                centerOnNode(nextNode.id);
              }
              break;
            }
          }

          updateViewport((current) => {
            if (event.key === 'ArrowLeft') {
              return { x: current.x + 32 };
            }
            if (event.key === 'ArrowRight') {
              return { x: current.x - 32 };
            }
            if (event.key === 'ArrowUp') {
              return { y: current.y + 32 };
            }
            return { y: current.y - 32 };
          });
          break;
        }
        case 'Enter':
        case ' ': {
          if (!focusedNodeId) {
            break;
          }
          event.preventDefault();
          const focusedNode = positionedNodes.find((node) => node.id === focusedNodeId);
          if (focusedNode) {
            handleNodeSelection(focusedNode);
          }
          break;
        }
        case 'Escape':
          event.preventDefault();
          setFocusedPath(null);
          updateSelection(DEFAULT_SELECTION);
          updateFocusedNode(null);
          break;
        default:
          break;
      }
    },
    [
      centerOnNode,
      fitView,
      focusedNodeId,
      handleNodeSelection,
      keyboardNavigation,
      positionedNodes,
      setFocusedPath,
      updateFocusedNode,
      updateSelection,
      updateViewport,
      zoomStep,
    ]
  );

  const handleNodeMouseEnter = useCallback(
    (nodeId: string) => {
      setHoveredNodeId(nodeId);
      const node = positionedNodes.find((entry) => entry.id === nodeId);
      if (node) {
        emitNodeHover(node, true);
      }
    },
    [emitNodeHover, positionedNodes, setHoveredNodeId]
  );

  const handleNodeMouseLeave = useCallback(() => {
    if (hoveredNodeId) {
      const node = positionedNodes.find((entry) => entry.id === hoveredNodeId);
      if (node) {
        emitNodeHover(node, false);
      }
    }
    setHoveredNodeId(null);
    setFocusedPath(null);
  }, [emitNodeHover, hoveredNodeId, positionedNodes, setFocusedPath, setHoveredNodeId]);

  const handlePathHover = useCallback(
    (nodeId: string, sourceIndex: number, pathKey?: string) => {
      setFocusedPath({ nodeId, sourceIndex, pathKey });
      const node = positionedNodes.find((entry) => entry.id === nodeId);
      if (node) {
        emitNodeHover(node, true, 'path');
      }
    },
    [emitNodeHover, positionedNodes, setFocusedPath]
  );

  const handlePathLeave = useCallback(() => {
    setFocusedPath(null);
  }, [setFocusedPath]);

  const handleEdgeHoverChange = useCallback(
    (edgeId: string, isHovered: boolean) => {
      const edge = positionedEdges.find((entry) => entry.id === edgeId);
      if (edge) {
        emitEdgeHover(edge, isHovered);
      }

      if (!cfg.hoverHighlight) {
        return;
      }

      setHoveredEdgeId(isHovered ? edgeId : null);
      if (isHovered) {
        setHoveredNodeId(null);
      }
    },
    [cfg.hoverHighlight, emitEdgeHover, positionedEdges, setHoveredEdgeId, setHoveredNodeId]
  );

  const svgStyle = useMemo(
    () => ({
      background: mergedTheme.background,
      fontFamily: mergedTheme.fontFamily,
      cursor: isDragging ? 'grabbing' : panEnabled ? 'grab' : 'default',
      outline: 'none',
      touchAction: panEnabled || zoomEnabled ? 'none' : 'auto',
      overflow: 'hidden',
      userSelect: 'none' as const,
    }),
    [isDragging, mergedTheme.background, mergedTheme.fontFamily, panEnabled, zoomEnabled]
  );

  const controlsOrigin = useMemo(
    () => getControlPosition(cfg.width, cfg.height, controlsPosition),
    [cfg.height, cfg.width, controlsPosition]
  );

  const selectionRect = selectionBox ? normalizeRect(selectionBox) : null;

  const viewportControls = showControls ? (
    <g
      aria-label="viewport-controls"
      transform={`translate(${controlsOrigin.x}, ${controlsOrigin.y})`}
    >
      {(
        [
          {
            key: 'zoom-in',
            label: '+',
            width: CONTROL_BUTTON_SIZE,
            onClick: () => updateViewport((current) => ({ zoom: current.zoom + zoomStep })),
          },
          {
            key: 'zoom-out',
            label: '−',
            width: CONTROL_BUTTON_SIZE,
            onClick: () => updateViewport((current) => ({ zoom: current.zoom - zoomStep })),
          },
          {
            key: 'fit-view',
            label: 'Fit',
            width: CONTROL_LABEL_BUTTON_WIDTH,
            onClick: () => fitView(),
          },
          {
            key: 'reset-view',
            label: '1:1',
            width: CONTROL_LABEL_BUTTON_WIDTH,
            onClick: () => updateViewport(DEFAULT_VIEWPORT),
          },
        ] as const
      )
        .reduce<{
          x: number;
          controls: Array<{
            key: string;
            label: string;
            width: number;
            x: number;
            onClick: () => void;
          }>;
        }>(
          (acc, control) => ({
            x: acc.x + control.width + CONTROL_BUTTON_GAP,
            controls: [...acc.controls, { ...control, x: acc.x }],
          }),
          { x: 0, controls: [] }
        )
        .controls.map((control) => (
          <g
            key={control.key}
            transform={`translate(${control.x}, 0)`}
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              control.onClick();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                control.onClick();
              }
            }}
          >
            <rect
              width={control.width}
              height={CONTROL_BUTTON_SIZE}
              rx={7}
              ry={7}
              fill="rgba(255,255,255,0.92)"
              stroke="rgba(15,23,42,0.18)"
            />
            <text
              x={control.width / 2}
              y={CONTROL_BUTTON_SIZE / 2 + 4}
              textAnchor="middle"
              fontSize={control.label.length > 1 ? 10 : 16}
              fontWeight={700}
              fill="#0f172a"
            >
              {control.label}
            </text>
          </g>
        ))}
    </g>
  ) : null;

  return (
    <svg
      ref={svgRef}
      width={cfg.width}
      height={cfg.height}
      role="figure"
      aria-label="Graph"
      tabIndex={0}
      style={svgStyle}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          updateSelection(DEFAULT_SELECTION);
          setFocusedPath(null);
          updateFocusedNode(null);
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
    >
      {showArrows ? (
        <defs>
          <marker
            id={arrowMarkerId}
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={edgeColor} />
          </marker>
          <marker
            id={hoverArrowMarkerId}
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={cfg.hoverEdgeColor} />
          </marker>
          <marker
            id={hoverIncomingArrowMarkerId}
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={cfg.hoverNodeOutColor} />
          </marker>
          <marker
            id={selectionArrowMarkerId}
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={selectionEdgeColor} />
          </marker>
        </defs>
      ) : null}

      <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
        <g ref={contentRef}>
          {renderBackground?.(renderContext)}

          <GraphLabels
            positionedNodes={positionedNodes}
            layout={cfg.layout}
            layoutDirection={cfg.layoutDirection}
            labels={cfg.labels}
            autoLabels={cfg.autoLabels}
            labelOffset={cfg.labelOffset}
            pillBackground={cfg.labelPillBackground}
            pillBorderColor={cfg.labelPillBorderColor}
            pillTextColor={cfg.labelPillTextColor}
          />

          <g aria-label="edges">
            {edgesForRender.map((edge) => {
              const edgeHovered =
                (cfg.hoverHighlight &&
                  (hoveredEdgeId === edge.id ||
                    (hoveredNodeId &&
                      (edge.source === hoveredNodeId || edge.target === hoveredNodeId)))) ||
                pathHighlight?.edges.has(edge.id);

              const isIncomingToHovered =
                hoveredNodeId &&
                !hoveredEdgeId &&
                edge.type !== 'undirected' &&
                edge.target === hoveredNodeId;

              return (
                <EdgeComponent
                  key={edge.id}
                  edge={edge}
                  color={edgeColor}
                  width={edgeWidth}
                  curveEdges={cfg.curveEdges && cfg.routingStyle !== 'orthogonal'}
                  curveStrength={cfg.curveStrength}
                  markerEnd={showArrows ? `url(#${arrowMarkerId})` : undefined}
                  isHovered={edgeHovered}
                  isSelected={
                    selectedEdgeSet.has(edge.id) || effectiveHighlightedEdgeSet.has(edge.id)
                  }
                  hoverColor={isIncomingToHovered ? cfg.hoverNodeOutColor : cfg.hoverEdgeColor}
                  selectionColor={
                    selectedEdgeSet.has(edge.id) ? selectionEdgeColor : highlightColor
                  }
                  labelColor={cfg.edgeLabelColor}
                  selectionMarker={showArrows ? `url(#${selectionArrowMarkerId})` : undefined}
                  hoverMarker={
                    showArrows
                      ? isIncomingToHovered
                        ? `url(#${hoverIncomingArrowMarkerId})`
                        : `url(#${hoverArrowMarkerId})`
                      : undefined
                  }
                  hoverEnabled={cfg.hoverHighlight}
                  hitStrokeWidth={edgeWidth + 8}
                  hoverStrokeWidth={edgeWidth + 1.5}
                  selectedStrokeWidth={edgeWidth + 1.5}
                  onHoverChange={(value) => handleEdgeHoverChange(edge.id, value)}
                  onClick={() => handleEdgeSelection(edge)}
                />
              );
            })}
          </g>

          <g aria-label="nodes">
            {positionedNodes.map((node) => (
              <GraphNode
                key={node.id}
                node={node}
                Vertex={Vertex}
                isSelected={selectedNodeSet.has(node.id)}
                isFocused={focusedNodeId === node.id}
                isHighlighted={effectiveHighlightedNodeSet.has(node.id)}
                activePathKey={focusedPath?.pathKey}
                activePathNodeIds={pathHighlight?.nodes}
                highlightColor={highlightColor}
                selectionColor={selectionColor}
                nodeBorderColor={nodeBorderColor}
                nodeBorderWidth={nodeBorderWidth}
                hoverNodeBorderColor={hoverNodeBorderColor}
                hoverNodeBothColor={hoverNodeBothColor}
                hoverNodeInColor={cfg.hoverNodeInColor}
                hoverNodeOutColor={cfg.hoverNodeOutColor}
                hoverNodeHighlight={cfg.hoverNodeHighlight}
                hoveredNodeStates={hoveredNodeStates ?? undefined}
                onNodeMeasure={handleNodeMeasure}
                onNodeFocus={updateFocusedNode}
                onNodeClick={handleNodeSelection}
                onNodeDoubleClick={handleNodeDoubleClick}
                onNodeMouseEnter={handleNodeMouseEnter}
                onNodeMouseLeave={handleNodeMouseLeave}
                onPathHover={handlePathHover}
                onPathLeave={handlePathLeave}
              />
            ))}
          </g>

          {renderOverlay?.(renderContext)}
        </g>
      </g>

      {selectionRect ? (
        <rect
          x={selectionRect.x}
          y={selectionRect.y}
          width={selectionRect.width}
          height={selectionRect.height}
          fill="rgba(59, 130, 246, 0.12)"
          stroke="rgba(59, 130, 246, 0.8)"
          strokeDasharray="6 4"
          pointerEvents="none"
        />
      ) : null}

      {viewportControls}
    </svg>
  );
};

type GraphComponent = <
  TGraph extends NxGraphInput = NxGraphInput,
  TNode extends PositionedNode<any, any, any> = PositionedNode,
  TEdge extends PositionedEdge<any, any> = PositionedEdge,
  TNodeRecord extends NodeData<any, any, any> = NodeData,
  TEdgeRecord extends EdgeData<any, any> = EdgeData,
>(
  props: GraphProps<TGraph, TNode, TEdge, TNodeRecord, TEdgeRecord> &
    React.RefAttributes<GraphHandle>
) => React.ReactElement | null;

const GraphBase = React.memo(
  React.forwardRef<GraphHandle, GraphProps<any, any, any, any, any>>(GraphInner)
);

GraphBase.displayName = 'Graph';

export const Graph = GraphBase as GraphComponent;

export default Graph;
