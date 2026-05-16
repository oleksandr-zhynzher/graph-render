import { DEFAULT_THEME, normalizeGraphConfig } from '@graph-render/core';
import type {
  EdgeData,
  GraphHandle,
  GraphProps,
  GraphRenderContext,
  NodeData,
  NxGraphInput,
  PositionedEdge,
  PositionedNode,
} from '@graph-render/types';
import { RoutingStyle, SelectionMode } from '@graph-render/types';
import React, { useCallback, useEffect, useId, useMemo, useRef } from 'react';

import {
  DEFAULT_CONTROLS_POSITION,
  DEFAULT_MAX_ZOOM,
  DEFAULT_MIN_ZOOM,
  DEFAULT_SELECTION,
  DEFAULT_SELECTION_COLOR,
  DEFAULT_VIEWPORT,
  DEFAULT_ZOOM_STEP,
} from '../constants/graph';
import { useGraphCollapse } from '../hooks/useGraphCollapse';
import { useGraphCollapseHandlers } from '../hooks/useGraphCollapseHandlers';
import { useGraphHover } from '../hooks/useGraphHover';
import { useGraphHoverHandlers } from '../hooks/useGraphHoverHandlers';
import { useGraphKeyboardNavigation } from '../hooks/useGraphKeyboardNavigation';
import { useGraphModel } from '../hooks/useGraphModel';
import { useGraphPointerInteractions } from '../hooks/useGraphPointerInteractions';
import { useGraphSelectionHandlers } from '../hooks/useGraphSelectionHandlers';
import { useGraphViewportController } from '../hooks/useGraphViewportController';
import { useGraphViewState } from '../hooks/useGraphViewState';
import { useGraphWheelZoom } from '../hooks/useGraphWheelZoom';
import { useStableConfig } from '../hooks/useStableConfig';
import { normalizeRect } from '../utils/selection';
import { EdgePath } from './EdgePath';
import { GraphEdgesLayer } from './GraphEdgesLayer';
import { GraphLabels } from './GraphLabels';
import { GraphMarkerDefs } from './GraphMarkerDefs';
import { GraphNodesLayer } from './GraphNodesLayer';
import { GraphSelectionOverlay } from './GraphSelectionOverlay';
import { GraphViewportControls } from './GraphViewportControls';

const normalizeZoomRange = (
  minZoom: number,
  maxZoom: number
): { readonly minZoom: number; readonly maxZoom: number } => {
  const safeMinZoom = Number.isFinite(minZoom) && minZoom > 0 ? minZoom : DEFAULT_MIN_ZOOM;
  const safeMaxZoom = Number.isFinite(maxZoom) && maxZoom > 0 ? maxZoom : DEFAULT_MAX_ZOOM;

  return safeMinZoom <= safeMaxZoom
    ? { minZoom: safeMinZoom, maxZoom: safeMaxZoom }
    : { minZoom: safeMaxZoom, maxZoom: safeMinZoom };
};

function GraphInner(
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
    translateExtent,
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
  }: GraphProps,
  ref: React.ForwardedRef<GraphHandle>
) {
  const zoomRange = useMemo(() => normalizeZoomRange(minZoom, maxZoom), [minZoom, maxZoom]);
  const safeMinZoom = zoomRange.minZoom;
  const safeMaxZoom = zoomRange.maxZoom;
  // Stabilize the config reference so that inline object literals passed by
  // consumers do not cascade a full model recompute on every parent render.
  const stableConfig = useStableConfig(config);
  const markerPrefix = useId().replaceAll(':', '-');
  const svgRef = useRef<SVGSVGElement>(null);
  const contentRef = useRef<SVGGElement>(null);

  const cfg = useMemo(() => normalizeGraphConfig(stableConfig), [stableConfig]);
  const mergedTheme = cfg.theme;
  const edgeColor = mergedTheme.edgeColor ?? DEFAULT_THEME.edgeColor ?? '#8b9dbf';
  const edgeWidth = mergedTheme.edgeWidth ?? DEFAULT_THEME.edgeWidth ?? 2;
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

  const {
    viewport,
    viewportRef,
    selection,
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
  const selectedNodeSet = useMemo(() => new Set(selection.nodeIds), [selection.nodeIds]);
  const selectedEdgeSet = useMemo(() => new Set(selection.edgeIds), [selection.edgeIds]);

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

  // FIX: pre-build O(1) id→node and id→edge lookup Maps so that hover callbacks
  // can use Map.get() instead of Array.find(), avoiding O(n) scans on every
  // pointer event (which was the main cause of per-hover full-tree re-renders).
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
      selection,
    }),
    [cfg, graph, positionedEdges, positionedNodes, selection, viewport]
  );

  const { handleEdgeSelection, handleNodeSelection } = useGraphSelectionHandlers({
    edgeSelectionEnabled,
    nodeSelectionEnabled,
    onEdgeClick,
    onNodeClick,
    selectionMode,
    updateFocusedNode,
    updateSelection,
  });

  const { handlePointerDown, handlePointerMove, handlePointerUp, isDragging, selectionBox } =
    useGraphPointerInteractions({
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
      viewport,
      zoomEnabled,
    });

  const handleWheel = useGraphWheelZoom({
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
    focusedNodeId,
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
    selection,
    setFocusedPath,
    setHoveredEdgeId,
    setHoveredNodeId,
    viewport,
  });

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

  return (
    <svg
      ref={svgRef}
      width={cfg.width}
      height={cfg.height}
      role="figure"
      aria-label="Graph"
      tabIndex={0}
      style={svgStyle}
      onClick={handleSvgClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
    >
      {showArrows ? (
        <GraphMarkerDefs
          arrowMarkerId={arrowMarkerId}
          edgeColor={edgeColor}
          hoverArrowMarkerId={hoverArrowMarkerId}
          hoverEdgeColor={cfg.hoverEdgeColor}
          hoverIncomingArrowMarkerId={hoverIncomingArrowMarkerId}
          hoverNodeOutColor={cfg.hoverNodeOutColor}
          selectionArrowMarkerId={selectionArrowMarkerId}
          selectionEdgeColor={selectionEdgeColor}
        />
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

          <GraphEdgesLayer
            edges={edgesForRender}
            EdgeComponent={EdgeComponent}
            edgeColor={edgeColor}
            edgeWidth={edgeWidth}
            curveEdges={cfg.curveEdges ? cfg.routingStyle !== RoutingStyle.Orthogonal : false}
            curveStrength={cfg.curveStrength}
            edgeLabelColor={cfg.edgeLabelColor}
            showArrows={showArrows}
            arrowMarkerId={arrowMarkerId}
            hoverArrowMarkerId={hoverArrowMarkerId}
            hoverIncomingArrowMarkerId={hoverIncomingArrowMarkerId}
            selectionArrowMarkerId={selectionArrowMarkerId}
            hoverHighlight={cfg.hoverHighlight}
            hoveredEdgeId={hoveredEdgeId}
            hoveredNodeId={hoveredNodeId}
            pathHighlightEdges={pathHighlight?.edges}
            selectedEdgeSet={selectedEdgeSet}
            highlightedEdgeSet={effectiveHighlightedEdgeSet}
            hoverEdgeColor={cfg.hoverEdgeColor}
            hoverNodeOutColor={cfg.hoverNodeOutColor}
            selectionEdgeColor={selectionEdgeColor}
            highlightColor={highlightColor}
            onEdgeHoverChange={handleEdgeHoverChange}
            onEdgeSelection={handleEdgeSelection}
          />

          <GraphNodesLayer
            nodes={positionedNodes}
            Vertex={Vertex}
            selectedNodeSet={selectedNodeSet}
            focusedNodeId={focusedNodeId}
            highlightedNodeSet={effectiveHighlightedNodeSet}
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

          {renderOverlay?.(renderContext)}
        </g>
      </g>

      <GraphSelectionOverlay rect={selectionRect} />

      {showControls ? (
        <GraphViewportControls
          width={cfg.width}
          height={cfg.height}
          position={controlsPosition}
          zoomIn={handleControlZoomIn}
          zoomOut={handleControlZoomOut}
          fitView={fitView}
          resetViewport={handleControlResetViewport}
        />
      ) : null}
    </svg>
  );
}

type GraphComponent = <
  TGraph extends NxGraphInput = NxGraphInput,
  TNode extends PositionedNode = PositionedNode,
  TEdge extends PositionedEdge = PositionedEdge,
  TNodeRecord extends NodeData = NodeData,
  TEdgeRecord extends EdgeData = EdgeData,
>(
  props: GraphProps<TGraph, TNode, TEdge, TNodeRecord, TEdgeRecord> &
    React.RefAttributes<GraphHandle>
) => React.ReactElement | null;

const GraphBase = React.memo(React.forwardRef<GraphHandle, GraphProps>(GraphInner));

GraphBase.displayName = 'Graph';

export const Graph = GraphBase as GraphComponent;

export default Graph;
