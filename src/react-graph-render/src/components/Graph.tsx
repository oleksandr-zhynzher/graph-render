import React, {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { layoutNodes, routeEdges, fromNxGraph, DEFAULT_THEME } from '@graph-render/core';
import {
  DragState,
  GraphHandle,
  GraphControlsPosition,
  GraphProps,
  GraphRenderContext,
  GraphSelection,
  GraphViewport,
  PositionedEdge,
  PositionedNode,
} from '@graph-render/types';
import { EdgePath } from './EdgePath';
import { GraphLabels } from './GraphLabels';
import { GraphNode } from './GraphNode';
import { useGraphHover } from '../hooks/useGraphHover';
import { DEFAULT_CONFIG } from '../constants/defaults';
import { centerViewportOnNode, clampZoom, getFitViewport, getGraphBounds } from '../utils/viewport';

const DEFAULT_VIEWPORT: GraphViewport = { x: 0, y: 0, zoom: 1 };
const DEFAULT_SELECTION: GraphSelection = { nodeIds: [], edgeIds: [] };
const DEFAULT_MIN_ZOOM = 0.25;
const DEFAULT_MAX_ZOOM = 2.5;
const DEFAULT_ZOOM_STEP = 0.12;
const DEFAULT_SELECTION_COLOR = '#f59e0b';
const DEFAULT_CONTROLS_POSITION: GraphControlsPosition = 'top-left';

type PointerState = { x: number; y: number };
type PinchState = {
  active: boolean;
  startDistance: number;
  startZoom: number;
  worldX: number;
  worldY: number;
};

const CONTROL_BUTTON_SIZE = 26;
const CONTROL_BUTTON_GAP = 8;

const getControlPosition = (
  width: number,
  height: number,
  position: GraphControlsPosition
): { x: number; y: number } => {
  const controlsWidth = CONTROL_BUTTON_SIZE * 4 + CONTROL_BUTTON_GAP * 3;
  const controlsHeight = CONTROL_BUTTON_SIZE;
  const inset = 12;

  switch (position) {
    case 'top-right':
      return { x: width - controlsWidth - inset, y: inset };
    case 'bottom-left':
      return { x: inset, y: height - controlsHeight - inset };
    case 'bottom-right':
      return {
        x: width - controlsWidth - inset,
        y: height - controlsHeight - inset,
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

const normalizeViewport = (
  viewport: GraphViewport,
  minZoom: number,
  maxZoom: number
): GraphViewport => ({
  x: Number.isFinite(viewport.x) ? viewport.x : 0,
  y: Number.isFinite(viewport.y) ? viewport.y : 0,
  zoom: clampZoom(Number.isFinite(viewport.zoom) ? viewport.zoom : 1, minZoom, maxZoom),
});

const toggleId = (values: string[], id: string, selectionMode: 'single' | 'multiple'): string[] => {
  if (selectionMode === 'single') {
    return values.length === 1 && values[0] === id ? [] : [id];
  }

  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
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
    onNodeClick,
    onEdgeClick,
  }: GraphProps,
  ref: React.ForwardedRef<GraphHandle>
) => {
  const markerPrefix = useId().replace(/:/g, '-');
  const [internalViewport, setInternalViewport] = useState<GraphViewport>(() =>
    normalizeViewport({ ...DEFAULT_VIEWPORT, ...(defaultViewport ?? {}) }, minZoom, maxZoom)
  );
  const [internalSelection, setInternalSelection] = useState<GraphSelection>({
    nodeIds: defaultSelectedNodeIds ?? [],
    edgeIds: defaultSelectedEdgeIds ?? [],
  });
  const [measuredNodeSizes, setMeasuredNodeSizes] = useState<
    Record<string, { width: number; height: number }>
  >({});
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

  const mergedTheme = useMemo(
    () => ({ ...DEFAULT_THEME, ...(config?.theme ?? {}) }),
    [config?.theme]
  );

  const cfg = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const selectionEdgeColor = edgeSelectionColor ?? selectionColor;
  const hoverNodeBorderColor = useMemo(
    () => cfg.hoverNodeBorderColor ?? cfg.hoverEdgeColor,
    [cfg.hoverNodeBorderColor, cfg.hoverEdgeColor]
  );
  const hoverNodeBothColor = useMemo(
    () => cfg.hoverNodeBothColor ?? cfg.hoverEdgeColor,
    [cfg.hoverNodeBothColor, cfg.hoverEdgeColor]
  );
  const nodeBorderColor = mergedTheme.nodeBorderColor;
  const nodeBorderWidth = mergedTheme.nodeBorderWidth ?? 0;
  const arrowMarkerId = `${markerPrefix}-arrow`;
  const hoverArrowMarkerId = `${markerPrefix}-arrow-hover`;
  const hoverIncomingArrowMarkerId = `${markerPrefix}-arrow-hover-in`;
  const selectionArrowMarkerId = `${markerPrefix}-arrow-selected`;

  const viewport = useMemo(
    () => normalizeViewport(controlledViewport ?? internalViewport, minZoom, maxZoom),
    [controlledViewport, internalViewport, minZoom, maxZoom]
  );

  const selection = useMemo<GraphSelection>(
    () => ({
      nodeIds: selectedNodeIds ?? internalSelection.nodeIds,
      edgeIds: selectedEdgeIds ?? internalSelection.edgeIds,
    }),
    [selectedNodeIds, selectedEdgeIds, internalSelection]
  );

  const selectedNodeSet = useMemo(() => new Set(selection.nodeIds), [selection.nodeIds]);
  const selectedEdgeSet = useMemo(() => new Set(selection.edgeIds), [selection.edgeIds]);

  const updateViewport = useCallback(
    (
      next:
        | Partial<GraphViewport>
        | ((current: GraphViewport) => Partial<GraphViewport> | GraphViewport)
    ) => {
      const rawNext = typeof next === 'function' ? next(viewport) : next;
      const normalized = normalizeViewport(
        {
          ...viewport,
          ...rawNext,
        },
        minZoom,
        maxZoom
      );

      if (!controlledViewport) {
        setInternalViewport(normalized);
      }
      onViewportChange?.(normalized);
      return normalized;
    },
    [viewport, minZoom, maxZoom, controlledViewport, onViewportChange]
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
    [selection, selectedNodeIds, selectedEdgeIds, onSelectionChange]
  );

  const { nodes: sourceNodes, edges: sourceEdges } = useMemo(
    () => fromNxGraph(graph, cfg.defaultEdgeType),
    [graph, cfg.defaultEdgeType]
  );

  const nodesWithMeasuredSize = useMemo(
    () =>
      sourceNodes.map((node) => ({
        ...node,
        measuredSize: measuredNodeSizes[node.id] ?? node.measuredSize,
      })),
    [sourceNodes, measuredNodeSizes]
  );

  const normalizedEdges = useMemo(
    () =>
      sourceEdges.map((edge) => ({
        ...edge,
        type: edge.type ?? cfg.defaultEdgeType,
      })),
    [sourceEdges, cfg.defaultEdgeType]
  );

  const layoutOptions = useMemo(
    () => ({
      nodes: nodesWithMeasuredSize,
      edges: normalizedEdges,
      theme: mergedTheme,
      padding: cfg.padding,
      layout: cfg.layout,
      width: cfg.width,
      height: cfg.height,
      layoutDirection: cfg.layoutDirection,
      nodeSizing: cfg.nodeSizing,
      fixedNodeSize: cfg.fixedNodeSize,
      labelMeasurementPaddingX: cfg.labelMeasurementPaddingX,
      labelMeasurementPaddingY: cfg.labelMeasurementPaddingY,
      labelMeasurementCharWidth: cfg.labelMeasurementCharWidth,
      labelMeasurementLineHeight: cfg.labelMeasurementLineHeight,
    }),
    [
      nodesWithMeasuredSize,
      normalizedEdges,
      mergedTheme,
      cfg.padding,
      cfg.layout,
      cfg.width,
      cfg.height,
      cfg.layoutDirection,
      cfg.nodeSizing,
      cfg.fixedNodeSize,
      cfg.labelMeasurementPaddingX,
      cfg.labelMeasurementPaddingY,
      cfg.labelMeasurementCharWidth,
      cfg.labelMeasurementLineHeight,
    ]
  );

  const handleNodeMeasure = useCallback(
    (nodeId: string, size: { width: number; height: number }) => {
      if (cfg.nodeSizing !== 'measured') {
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
    [cfg.nodeSizing]
  );

  const positionedNodes: PositionedNode[] = useMemo(
    () => (layoutNodesOverride ? layoutNodesOverride(layoutOptions) : layoutNodes(layoutOptions)),
    [layoutNodesOverride, layoutOptions]
  );

  const edgeRoutingOptions = useMemo(
    () => ({
      arrowPadding: cfg.arrowPadding,
      straight: !cfg.curveEdges,
      layoutDirection: cfg.layoutDirection,
      forceRightToLeft: cfg.forceRightToLeft,
    }),
    [cfg.arrowPadding, cfg.curveEdges, cfg.layoutDirection, cfg.forceRightToLeft]
  );

  const positionedEdges: PositionedEdge[] = useMemo(
    () =>
      routeEdgesOverride
        ? routeEdgesOverride(positionedNodes, normalizedEdges, edgeRoutingOptions)
        : routeEdges(positionedNodes, normalizedEdges, edgeRoutingOptions),
    [routeEdgesOverride, positionedNodes, normalizedEdges, edgeRoutingOptions]
  );

  const graphBounds = useMemo(() => getGraphBounds(positionedNodes), [positionedNodes]);

  const fitView = useCallback(
    (padding: number = fitViewPadding) => {
      updateViewport(getFitViewport(graphBounds, cfg.width, cfg.height, padding, minZoom, maxZoom));
    },
    [updateViewport, graphBounds, cfg.width, cfg.height, fitViewPadding, minZoom, maxZoom]
  );

  const centerOnNode = useCallback(
    (nodeId: string) => {
      const node = positionedNodes.find((item) => item.id === nodeId);
      if (!node) {
        return;
      }
      updateViewport(centerViewportOnNode(node, cfg.width, cfg.height, viewport.zoom));
    },
    [positionedNodes, cfg.width, cfg.height, updateViewport, viewport.zoom]
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
    [fitView, centerOnNode, updateViewport, updateSelection, viewport, zoomStep]
  );

  useEffect(() => {
    if (fitViewOnMount) {
      fitView();
    }
  }, [fitViewOnMount, fitView, graphBounds]);

  const {
    hoveredEdgeId,
    setHoveredEdgeId,
    hoveredNodeId,
    setHoveredNodeId,
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
    [graph, positionedNodes, positionedEdges, cfg, viewport, selection]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (event.pointerType === 'touch') {
        activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

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
          (event.target as Element).setPointerCapture?.(event.pointerId);
          return;
        }
      }

      if (!panEnabled || event.button !== 0) {
        return;
      }

      const target = event.target as Element;
      if (
        target.closest('[data-graph-node-interactive="true"], [data-graph-edge-interactive="true"]')
      ) {
        return;
      }

      dragRef.current = {
        active: true,
        startX: event.clientX,
        startY: event.clientY,
        originX: viewport.x,
        originY: viewport.y,
      };
      target.setPointerCapture?.(event.pointerId);
    },
    [panEnabled, viewport.x, viewport.y]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (event.pointerType === 'touch' && activePointersRef.current.has(event.pointerId)) {
        activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (pinchRef.current.active && activePointersRef.current.size >= 2) {
          const [first, second] = Array.from(activePointersRef.current.values());
          const midpoint = getPointerMidpoint(first, second);
          const distance = getPointerDistance(first, second);
          const nextZoom = clampZoom(
            pinchRef.current.startZoom * (distance / Math.max(1, pinchRef.current.startDistance)),
            minZoom,
            maxZoom
          );

          updateViewport({
            zoom: nextZoom,
            x: midpoint.x - pinchRef.current.worldX * nextZoom,
            y: midpoint.y - pinchRef.current.worldY * nextZoom,
          });
          return;
        }
      }

      if (!panEnabled || !dragRef.current.active) {
        return;
      }

      const dx = event.clientX - dragRef.current.startX;
      const dy = event.clientY - dragRef.current.startY;
      updateViewport({
        x: dragRef.current.originX + dx,
        y: dragRef.current.originY + dy,
      });
    },
    [panEnabled, updateViewport]
  );

  const handlePointerUp = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    activePointersRef.current.delete(event.pointerId);

    if (activePointersRef.current.size < 2) {
      pinchRef.current.active = false;
    }

    dragRef.current.active = false;
    (event.target as Element).releasePointerCapture?.(event.pointerId);
  }, []);

  const handleWheel = useCallback(
    (event: React.WheelEvent<SVGSVGElement>) => {
      if (!zoomEnabled || !svgRef.current) {
        return;
      }

      event.preventDefault();
      const rect = svgRef.current.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const worldX = (pointerX - viewport.x) / viewport.zoom;
      const worldY = (pointerY - viewport.y) / viewport.zoom;
      const nextZoom = clampZoom(
        viewport.zoom + (event.deltaY < 0 ? zoomStep : -zoomStep),
        minZoom,
        maxZoom
      );

      updateViewport({
        zoom: nextZoom,
        x: pointerX - worldX * nextZoom,
        y: pointerY - worldY * nextZoom,
      });
    },
    [zoomEnabled, viewport, zoomStep, minZoom, maxZoom, updateViewport]
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
          event.preventDefault();
          updateViewport((current) => ({ x: current.x + 32 }));
          break;
        case 'ArrowRight':
          event.preventDefault();
          updateViewport((current) => ({ x: current.x - 32 }));
          break;
        case 'ArrowUp':
          event.preventDefault();
          updateViewport((current) => ({ y: current.y + 32 }));
          break;
        case 'ArrowDown':
          event.preventDefault();
          updateViewport((current) => ({ y: current.y - 32 }));
          break;
        case 'Escape':
          event.preventDefault();
          setFocusedPath(null);
          updateSelection(DEFAULT_SELECTION);
          break;
        default:
          break;
      }
    },
    [keyboardNavigation, updateViewport, zoomStep, fitView, setFocusedPath, updateSelection]
  );

  const handleNodeMouseEnter = useCallback(
    (nodeId: string) => setHoveredNodeId(nodeId),
    [setHoveredNodeId]
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
    setFocusedPath(null);
  }, [setHoveredNodeId, setFocusedPath]);

  const handlePathHover = useCallback(
    (nodeId: string, sourceIndex: number, pathKey?: string) => {
      setFocusedPath({ nodeId, sourceIndex, pathKey });
    },
    [setFocusedPath]
  );

  const handlePathLeave = useCallback(() => {
    setFocusedPath(null);
  }, [setFocusedPath]);

  const handleEdgeHoverChange = useCallback(
    (edgeId: string, isHovered: boolean) => {
      if (!cfg.hoverHighlight) {
        return;
      }
      setHoveredEdgeId(isHovered ? edgeId : null);
      if (isHovered) {
        setHoveredNodeId(null);
      }
    },
    [cfg.hoverHighlight, setHoveredEdgeId, setHoveredNodeId]
  );

  const handleNodeSelection = useCallback(
    (node: PositionedNode) => {
      if (!nodeSelectionEnabled) {
        onNodeClick?.(node);
        return;
      }

      updateSelection((current) => ({
        nodeIds: toggleId(current.nodeIds, node.id, selectionMode),
        edgeIds: selectionMode === 'single' ? [] : current.edgeIds,
      }));
      onNodeClick?.(node);
    },
    [nodeSelectionEnabled, onNodeClick, selectionMode, updateSelection]
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

  const svgStyle = useMemo(
    () => ({
      background: mergedTheme.background,
      fontFamily: mergedTheme.fontFamily,
      cursor: dragRef.current.active ? 'grabbing' : panEnabled ? 'grab' : 'default',
      outline: 'none',
      touchAction: panEnabled || zoomEnabled ? 'none' : 'auto',
      overflow: 'hidden',
      userSelect: 'none' as const,
    }),
    [mergedTheme.background, mergedTheme.fontFamily, panEnabled, zoomEnabled]
  );

  const controlsOrigin = useMemo(
    () => getControlPosition(cfg.width, cfg.height, controlsPosition),
    [cfg.width, cfg.height, controlsPosition]
  );

  const viewportControls = showControls ? (
    <g
      aria-label="viewport-controls"
      transform={`translate(${controlsOrigin.x}, ${controlsOrigin.y})`}
    >
      {[
        {
          key: 'zoom-in',
          label: '+',
          onClick: () => updateViewport((current) => ({ zoom: current.zoom + zoomStep })),
        },
        {
          key: 'zoom-out',
          label: '−',
          onClick: () => updateViewport((current) => ({ zoom: current.zoom - zoomStep })),
        },
        {
          key: 'fit-view',
          label: 'Fit',
          onClick: () => fitView(),
        },
        {
          key: 'reset-view',
          label: '1:1',
          onClick: () => updateViewport(DEFAULT_VIEWPORT),
        },
      ].map((control, index) => {
        const x = index * (CONTROL_BUTTON_SIZE + CONTROL_BUTTON_GAP);
        const width = control.label.length > 1 ? CONTROL_BUTTON_SIZE + 10 : CONTROL_BUTTON_SIZE;
        const adjustedX = index === 0 ? 0 : x + (index > 1 ? 10 : 0);

        return (
          <g
            key={control.key}
            transform={`translate(${adjustedX}, 0)`}
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
              width={width}
              height={CONTROL_BUTTON_SIZE}
              rx={7}
              ry={7}
              fill="rgba(255,255,255,0.92)"
              stroke="rgba(15,23,42,0.18)"
            />
            <text
              x={width / 2}
              y={CONTROL_BUTTON_SIZE / 2 + 4}
              textAnchor="middle"
              fontSize={control.label.length > 1 ? 10 : 16}
              fontWeight={700}
              fill="#0f172a"
            >
              {control.label}
            </text>
          </g>
        );
      })}
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
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
    >
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
          <path d="M 0 0 L 10 5 L 0 10 z" fill={mergedTheme.edgeColor} />
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

      <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
        {renderBackground?.(renderContext)}

        <GraphLabels
          positionedNodes={positionedNodes}
          layout={cfg.layout}
          layoutDirection={cfg.layoutDirection}
          labels={cfg.labels}
          autoLabels={cfg.autoLabels}
          labelOffset={cfg.labelOffset}
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
                color={mergedTheme.edgeColor}
                width={mergedTheme.edgeWidth}
                curveEdges={cfg.curveEdges}
                curveStrength={cfg.curveStrength}
                markerEnd={`url(#${arrowMarkerId})`}
                isHovered={edgeHovered}
                isSelected={selectedEdgeSet.has(edge.id)}
                hoverColor={isIncomingToHovered ? cfg.hoverNodeOutColor : cfg.hoverEdgeColor}
                selectionColor={selectionEdgeColor}
                selectionMarker={`url(#${selectionArrowMarkerId})`}
                hoverMarker={
                  isIncomingToHovered
                    ? `url(#${hoverIncomingArrowMarkerId})`
                    : `url(#${hoverArrowMarkerId})`
                }
                hoverEnabled={cfg.hoverHighlight}
                hitStrokeWidth={mergedTheme.edgeWidth + 8}
                hoverStrokeWidth={mergedTheme.edgeWidth + 1.5}
                selectedStrokeWidth={mergedTheme.edgeWidth + 1.5}
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
              onNodeClick={handleNodeSelection}
              onNodeMouseEnter={handleNodeMouseEnter}
              onNodeMouseLeave={handleNodeMouseLeave}
              onPathHover={handlePathHover}
              onPathLeave={handlePathLeave}
            />
          ))}
        </g>

        {renderOverlay?.(renderContext)}
      </g>

      {viewportControls}
    </svg>
  );
};

export const Graph = React.memo(React.forwardRef<GraphHandle, GraphProps>(GraphInner));

Graph.displayName = 'Graph';

export default Graph;
