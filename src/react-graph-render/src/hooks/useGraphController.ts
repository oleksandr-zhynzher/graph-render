import { DEFAULT_THEME, normalizeGraphConfig } from '@graph-render/core';
import { NodeSizingMode } from '@graph-render/types';
import type { GraphHandle, GraphProps, GraphRenderContext } from '@graph-render/types/react';
import { SelectionMode } from '@graph-render/types/react';
import { useCallback, useDeferredValue, useEffect, useId, useMemo, useRef } from 'react';

import { EdgePath } from '../components/EdgePath';
import type { GraphCanvasProps } from '../components/GraphCanvas';
import {
  DEFAULT_CONTROL_FILL,
  DEFAULT_CONTROL_FOCUS_STROKE,
  DEFAULT_CONTROL_STROKE,
  DEFAULT_CONTROL_TEXT_COLOR,
  DEFAULT_CONTROLS_POSITION,
  DEFAULT_MARQUEE_FILL,
  DEFAULT_MARQUEE_STROKE,
  DEFAULT_MAX_ZOOM,
  DEFAULT_MIN_ZOOM,
  DEFAULT_NODE_FILL,
  DEFAULT_NODE_RADIUS,
  DEFAULT_NODE_STROKE,
  DEFAULT_SELECTION,
  DEFAULT_SELECTION_COLOR,
  DEFAULT_TEXT_FILL,
  DEFAULT_TEXT_SIZE,
  DEFAULT_VIEWPORT,
  DEFAULT_ZOOM_STEP,
} from '../constants/graph';
import { createNodeMeasurementScheduler } from '../utils/nodeMeasurementScheduler';
import { resolveInteractionFlags, resolveViewportFlags } from '../utils/resolveGraphProps';
import { normalizeRect } from '../utils/selection';
import { normalizeZoomRange } from '../utils/viewport';
import { useGraphCollapse } from './useGraphCollapse';
import { useGraphCollapseHandlers } from './useGraphCollapseHandlers';
import { useGraphCulling } from './useGraphCulling';
import { useGraphHover } from './useGraphHover';
import { useGraphHoverHandlers } from './useGraphHoverHandlers';
import { useGraphKeyboardNavigation } from './useGraphKeyboardNavigation';
import { useGraphModel } from './useGraphModel';
import { useGraphPointerInteractions } from './useGraphPointerInteractions';
import { useGraphSelectionHandlers } from './useGraphSelectionHandlers';
import { useGraphViewportController } from './useGraphViewportController';
import { useGraphViewState } from './useGraphViewState';
import { useGraphVisibleSelection } from './useGraphVisibleSelection';
import { useGraphWheelZoomListener } from './useGraphWheelZoomListener';
import { useStableConfig } from './useStableConfig';

export const useGraphController = (
  props: GraphProps,
  ref: React.ForwardedRef<GraphHandle>
): GraphCanvasProps => {
  const {
    graph,
    vertexComponent: Vertex,
    edgeComponent: EdgeComponent = EdgePath,
    config,
    interaction,
    viewportOptions,
    viewportCulling = true,
    onLayoutChange,
    viewport: controlledViewport,
    defaultViewport,
    onViewportChange,
    fitViewOnMount = false,
    fitViewPadding = 32,
    minZoom: minZoomProp,
    maxZoom: maxZoomProp,
    zoomStep: zoomStepProp,
    translateExtent: translateExtentProp,
    panEnabled: panEnabledProp,
    zoomEnabled: zoomEnabledProp,
    pinchZoomEnabled: pinchZoomEnabledProp,
    keyboardNavigation: keyboardNavigationProp,
    showControls: showControlsProp,
    controlsPosition: controlsPositionProp,
    marqueeSelectionEnabled: marqueeSelectionEnabledProp,
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
    selectionMode = SelectionMode.Single,
    nodeSelectionEnabled = true,
    edgeSelectionEnabled = true,
    selectionColor = DEFAULT_SELECTION_COLOR,
    edgeSelectionColor,
    layoutNodesOverride,
    routeEdgesOverride,
    renderBackground,
    renderOverlay,
    onError,
    onNodeHoverChange,
    onEdgeHoverChange,
    onNodeClick,
    onEdgeClick,
  } = props;

  const { panEnabled, zoomEnabled, pinchZoomEnabled, keyboardNavigation, marqueeSelectionEnabled } =
    resolveInteractionFlags(interaction, {
      panEnabled: panEnabledProp,
      zoomEnabled: zoomEnabledProp,
      pinchZoomEnabled: pinchZoomEnabledProp,
      keyboardNavigation: keyboardNavigationProp,
      marqueeSelectionEnabled: marqueeSelectionEnabledProp,
    });
  const {
    minZoom = DEFAULT_MIN_ZOOM,
    maxZoom = DEFAULT_MAX_ZOOM,
    zoomStep = DEFAULT_ZOOM_STEP,
    translateExtent,
    showControls,
    controlsPosition = DEFAULT_CONTROLS_POSITION,
  } = resolveViewportFlags(viewportOptions, {
    minZoom: minZoomProp,
    maxZoom: maxZoomProp,
    zoomStep: zoomStepProp,
    translateExtent: translateExtentProp,
    showControls: showControlsProp,
    controlsPosition: controlsPositionProp,
  });

  const zoomRange = useMemo(() => normalizeZoomRange(minZoom, maxZoom), [minZoom, maxZoom]);
  const safeMinZoom = zoomRange.minZoom;
  const safeMaxZoom = zoomRange.maxZoom;
  const stableConfig = useStableConfig(config);
  const markerPrefix = useId().replaceAll(':', '-');
  const svgDescId = `${markerPrefix}-desc`;
  const svgRef = useRef<SVGSVGElement>(null);
  const contentRef = useRef<SVGGElement>(null);
  const measurementScheduler = useMemo(() => createNodeMeasurementScheduler(), []);

  useEffect(() => {
    return () => {
      measurementScheduler.cancelAll();
    };
  }, [measurementScheduler]);

  const cfg = useMemo(() => normalizeGraphConfig(stableConfig), [stableConfig]);
  const effectiveViewportCulling = viewportCulling && cfg.nodeSizing !== NodeSizingMode.Measured;
  const mergedTheme = cfg.theme;
  const edgeColor = mergedTheme.edgeColor ?? DEFAULT_THEME.edgeColor ?? '#8b9dbf';
  const edgeWidth = mergedTheme.edgeWidth ?? DEFAULT_THEME.edgeWidth ?? 2;
  const selectionEdgeColor = edgeSelectionColor ?? selectionColor;
  const hoverNodeBorderColor = cfg.hoverNodeBorderColor ?? cfg.hoverEdgeColor;
  const hoverNodeBothColor = cfg.hoverNodeBothColor ?? cfg.hoverEdgeColor;
  const nodeBorderColor = mergedTheme.nodeBorderColor;
  const nodeBorderWidth = mergedTheme.nodeBorderWidth ?? 0;
  const nodeFill = mergedTheme.nodeFill ?? DEFAULT_NODE_FILL;
  const nodeStroke = mergedTheme.nodeStroke ?? DEFAULT_NODE_STROKE;
  const nodeTextColor = mergedTheme.nodeTextColor ?? DEFAULT_TEXT_FILL;
  const nodeTextSize = mergedTheme.nodeTextSize ?? DEFAULT_TEXT_SIZE;
  const nodeRadius = mergedTheme.nodeRadius ?? DEFAULT_NODE_RADIUS;
  const fontFamily =
    mergedTheme.fontFamily ??
    DEFAULT_THEME.fontFamily ??
    'system-ui, -apple-system, Segoe UI, sans-serif';
  const marqueeFill = mergedTheme.marqueeFill ?? DEFAULT_MARQUEE_FILL;
  const marqueeStroke = mergedTheme.marqueeStroke ?? DEFAULT_MARQUEE_STROKE;
  const controlFill = mergedTheme.controlFill ?? DEFAULT_CONTROL_FILL;
  const controlStroke = mergedTheme.controlStroke ?? DEFAULT_CONTROL_STROKE;
  const controlTextColor = mergedTheme.controlTextColor ?? DEFAULT_CONTROL_TEXT_COLOR;
  const controlFocusStroke = mergedTheme.controlFocusStroke ?? DEFAULT_CONTROL_FOCUS_STROKE;
  const showArrows = cfg.showArrows;
  const arrowMarkerId = `${markerPrefix}-arrow`;
  const hoverArrowMarkerId = `${markerPrefix}-arrow-hover`;
  const hoverIncomingArrowMarkerId = `${markerPrefix}-arrow-hover-in`;
  const selectionArrowMarkerId = `${markerPrefix}-arrow-selected`;

  const {
    viewport,
    viewportRef,
    selection,
    selectionRef,
    focusedNodeId,
    updateViewport,
    updateSelection,
    updateFocusedNode,
  } = useGraphViewState({
    controlledViewport,
    defaultViewport,
    safeMinZoom,
    safeMaxZoom,
    onViewportChange,
    selectedNodeIds,
    selectedEdgeIds,
    defaultSelectedNodeIds,
    defaultSelectedEdgeIds,
    onSelectionChange,
    controlledFocusedNodeId,
    defaultFocusedNodeId,
    onFocusedNodeChange,
  });

  const {
    collapsedIds,
    collapsedNodeSet,
    pendingExpansionNodeSet,
    updateCollapsedNodeIds,
    setPendingExpansionNodeIds,
  } = useGraphCollapse({
    collapsedNodeIds,
    defaultCollapsedNodeIds,
    onCollapsedNodeIdsChange,
  });

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
    onError,
  });

  const handleNodeDoubleClick = useGraphCollapseHandlers({
    childNodeIdsByParent,
    collapsedNodeSet,
    graph,
    onError,
    onNodeCollapse,
    onNodeExpand,
    pendingExpansionNodeSet,
    setPendingExpansionNodeIds,
    toggleCollapseOnNodeDoubleClick,
    updateCollapsedNodeIds,
  });

  const { effectiveFocusedNodeId, effectiveSelection, selectedEdgeSet, selectedNodeSet } =
    useGraphVisibleSelection({
      focusedNodeId,
      selection,
      selectionRef,
      updateFocusedNode,
      updateSelection,
      visibleEdges,
      visibleNodes: visibleNodesWithMeasuredSize,
    });

  const positionedNodeMap = useMemo(
    () => new Map(positionedNodes.map((n) => [n.id, n])),
    [positionedNodes]
  );
  const positionedEdgeMap = useMemo(
    () => new Map(positionedEdges.map((e) => [e.id, e])),
    [positionedEdges]
  );

  const { centerOnNode, fitView, getViewportDimensions } = useGraphViewportController({
    cfg,
    fitViewOnMount,
    fitViewPadding,
    graph,
    positionedEdges,
    positionedNodeMap,
    positionedNodes,
    ref,
    safeMaxZoom,
    safeMinZoom,
    svgRef,
    updateSelection,
    updateViewport,
    viewport,
    zoomStep,
  });

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
      selection: effectiveSelection,
    }),
    [cfg, effectiveSelection, graph, positionedEdges, positionedNodes, viewport]
  );

  const onLayoutChangeRef = useRef(onLayoutChange);
  onLayoutChangeRef.current = onLayoutChange;

  useEffect(() => {
    onLayoutChangeRef.current?.({
      graph,
      nodes: positionedNodes,
      edges: positionedEdges,
      config: cfg,
      viewport: viewportRef.current,
      selection: selectionRef.current,
    });
  }, [cfg, graph, positionedEdges, positionedNodes, selectionRef, viewportRef]);

  const { handleEdgeSelection, handleNodeSelection } = useGraphSelectionHandlers({
    edgeSelectionEnabled,
    nodeSelectionEnabled,
    onEdgeClick,
    onNodeClick,
    selectionMode,
    updateFocusedNode,
    updateSelection,
  });

  const {
    handlePointerCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isDragging,
    selectionBox,
  } = useGraphPointerInteractions({
    getViewportDimensions,
    marqueeSelectionEnabled,
    panEnabled,
    pinchZoomEnabled,
    positionedEdges,
    positionedNodes,
    safeMaxZoom,
    safeMinZoom,
    selectionMode,
    svgRef,
    translateExtent,
    updateSelection,
    updateViewport,
    viewportRef,
    zoomEnabled,
  });

  const cullingViewport = useDeferredValue(viewport);
  const { culledEdges: culledEdgesForRender, culledNodes } = useGraphCulling({
    enabled: effectiveViewportCulling && !isDragging,
    edges: edgesForRender,
    height: cfg.height,
    nodes: positionedNodes,
    viewport: cullingViewport,
    width: cfg.width,
  });

  useGraphWheelZoomListener({
    getViewportDimensions,
    safeMaxZoom,
    safeMinZoom,
    svgRef,
    translateExtent,
    updateViewport,
    viewportRef,
    zoomEnabled,
    zoomStep,
  });

  const handleKeyDown = useGraphKeyboardNavigation({
    centerOnNode,
    fitView,
    focusedNodeId: effectiveFocusedNodeId,
    handleNodeSelection,
    keyboardNavigation,
    positionedNodeMap,
    positionedNodes,
    setFocusedPath,
    updateFocusedNode,
    updateSelection,
    updateViewport,
    zoomStep,
  });

  const {
    handleEdgeHoverChange,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    handlePathHover,
    handlePathLeave,
  } = useGraphHoverHandlers({
    hoverHighlight: cfg.hoverHighlight,
    onEdgeHoverChange,
    onNodeHoverChange,
    positionedEdgeMap,
    positionedNodeMap,
    selection: effectiveSelection,
    setFocusedPath,
    setHoveredEdgeId,
    setHoveredNodeId,
    viewport,
  });

  const svgRole = keyboardNavigation ? 'application' : 'figure';

  const svgStyle = useMemo(
    () => ({
      background: mergedTheme.background,
      fontFamily: mergedTheme.fontFamily,
      cursor: isDragging ? 'grabbing' : panEnabled ? 'grab' : 'default',
      touchAction: panEnabled || zoomEnabled ? 'none' : 'auto',
      overflow: 'hidden',
      userSelect: 'none' as const,
    }),
    [isDragging, mergedTheme.background, mergedTheme.fontFamily, panEnabled, zoomEnabled]
  );

  const selectionRect = selectionBox ? normalizeRect(selectionBox) : null;
  const handleControlZoomIn = useCallback(
    () => updateViewport((current) => ({ zoom: current.zoom + zoomStep })),
    [updateViewport, zoomStep]
  );
  const handleControlZoomOut = useCallback(
    () => updateViewport((current) => ({ zoom: current.zoom - zoomStep })),
    [updateViewport, zoomStep]
  );
  const handleControlResetViewport = useCallback(
    () => updateViewport(DEFAULT_VIEWPORT),
    [updateViewport]
  );
  const handleSvgClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (event.target === event.currentTarget) {
        updateSelection(DEFAULT_SELECTION);
        setFocusedPath(null);
        updateFocusedNode(null);
      }
    },
    [setFocusedPath, updateFocusedNode, updateSelection]
  );

  return {
    svgRef,
    contentRef,
    cfg,
    viewport,
    svgDescId,
    svgRole,
    svgStyle,
    Vertex,
    EdgeComponent,
    renderBackground,
    renderOverlay,
    renderContext,
    showArrows,
    arrowMarkerId,
    hoverArrowMarkerId,
    hoverIncomingArrowMarkerId,
    selectionArrowMarkerId,
    edgeColor,
    edgeWidth,
    selectionEdgeColor,
    culledEdgesForRender,
    culledNodes,
    positionedNodes,
    hoveredEdgeId,
    hoveredNodeId,
    pathHighlightEdges: pathHighlight?.edges,
    selectedEdgeSet,
    edgeSelectionEnabled,
    edgeInteractive: edgeSelectionEnabled || Boolean(onEdgeClick),
    effectiveHighlightedEdgeSet,
    selectedNodeSet,
    nodeSelectionEnabled,
    effectiveFocusedNodeId,
    effectiveHighlightedNodeSet,
    focusedPathKey: focusedPath?.pathKey,
    activePathNodeIds: pathHighlight?.nodes,
    highlightColor,
    selectionColor,
    nodeBorderColor,
    nodeBorderWidth,
    hoverNodeBorderColor,
    hoverNodeBothColor,
    hoverNodeInColor: cfg.hoverNodeInColor,
    hoverNodeOutColor: cfg.hoverNodeOutColor,
    hoverNodeHighlight: cfg.hoverNodeHighlight,
    hoveredNodeStates: hoveredNodeStates ?? undefined,
    measurementScheduler,
    handleNodeMeasure,
    updateFocusedNode,
    handleNodeSelection,
    handleNodeDoubleClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    handlePathHover,
    handlePathLeave,
    handleEdgeHoverChange,
    handleEdgeSelection,
    selectionRect,
    marqueeFill,
    marqueeStroke,
    nodeFill,
    nodeStroke,
    nodeTextColor,
    nodeTextSize,
    nodeRadius,
    fontFamily,
    controlFill,
    controlStroke,
    controlTextColor,
    controlFocusStroke,
    showControls,
    controlsPosition,
    handleControlZoomIn,
    handleControlZoomOut,
    fitView,
    handleControlResetViewport,
    handleSvgClick,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleKeyDown,
  };
};
