import React, { useCallback, useMemo, useRef, useState } from 'react';
import { layoutNodes, routeEdges, fromNxGraph, DEFAULT_THEME } from '@graph-render/core';
import { GraphProps, PositionedNode, PositionedEdge, DragState } from '@graph-render/types';
import { EdgePath } from './EdgePath';
import { GraphLabels } from './GraphLabels';
import { GraphNode } from './GraphNode';
import { useGraphHover } from '../hooks/useGraphHover';
import { DEFAULT_CONFIG } from '../constants/defaults';

export const Graph = React.memo<GraphProps>(function Graph({
  graph,
  vertexComponent: Vertex,
  config,
  onNodeClick,
  onEdgeClick,
}) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<DragState>({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const mergedTheme = useMemo(
    () => ({ ...DEFAULT_THEME, ...(config?.theme ?? {}) }),
    [config?.theme]
  );

  const cfg = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

  const hoverNodeBorderColor = useMemo(
    () => cfg.hoverNodeBorderColor ?? cfg.hoverEdgeColor,
    [cfg.hoverNodeBorderColor, cfg.hoverEdgeColor]
  );

  const hoverNodeBothColor = useMemo(
    () => cfg.hoverNodeBothColor ?? cfg.hoverEdgeColor,
    [cfg.hoverNodeBothColor, cfg.hoverEdgeColor]
  );

  const nodeBorderColor = (mergedTheme as any).nodeBorderColor;
  const nodeBorderWidth = (mergedTheme as any).nodeBorderWidth ?? 0;

  const { nodes: sourceNodes, edges: sourceEdges } = useMemo(
    () => fromNxGraph(graph, cfg.defaultEdgeType),
    [graph, cfg.defaultEdgeType]
  );

  const normalizedEdges = useMemo(
    () =>
      sourceEdges.map((edge) => ({
        ...edge,
        type: edge.type ?? cfg.defaultEdgeType,
      })),
    [sourceEdges, cfg.defaultEdgeType]
  );

  const positionedNodes: PositionedNode[] = useMemo(
    () =>
      layoutNodes({
        nodes: sourceNodes,
        edges: normalizedEdges,
        theme: mergedTheme,
        padding: cfg.padding,
        layout: cfg.layout as any,
        width: cfg.width,
        height: cfg.height,
        layoutDirection: cfg.layoutDirection as any,
      }),
    [
      sourceNodes,
      normalizedEdges,
      mergedTheme,
      cfg.padding,
      cfg.layout,
      cfg.width,
      cfg.height,
      cfg.layoutDirection,
    ]
  );

  const positionedEdges: PositionedEdge[] = useMemo(
    () =>
      routeEdges(positionedNodes, normalizedEdges, {
        arrowPadding: cfg.arrowPadding,
        straight: !cfg.curveEdges,
        forceRightToLeft: cfg.forceRightToLeft,
      }),
    [positionedNodes, normalizedEdges, cfg.arrowPadding, cfg.curveEdges, cfg.forceRightToLeft]
  );

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

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        originX: pan.x,
        originY: pan.y,
      };
      (e.target as Element).setPointerCapture?.(e.pointerId);
    },
    [pan.x, pan.y]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPan({
      x: dragRef.current.originX + dx,
      y: dragRef.current.originY + dy,
    });
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    dragRef.current.active = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  }, []);

  const handleNodeMouseEnter = useCallback(
    (nodeId: string) => setHoveredNodeId(nodeId),
    [setHoveredNodeId]
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
    setFocusedPath(null);
  }, [setHoveredNodeId, setFocusedPath]);

  const handlePathHover = useCallback(
    (nodeId: string, sourceIndex: number, playerKey?: string) => {
      setFocusedPath({ nodeId, sourceIndex, playerKey });
    },
    [setFocusedPath]
  );

  const handlePathLeave = useCallback(() => {
    setFocusedPath(null);
  }, [setFocusedPath]);

  const handleEdgeHoverChange = useCallback(
    (edgeId: string, isHovered: boolean) => {
      if (!cfg.hoverHighlight) return;
      setHoveredEdgeId(isHovered ? edgeId : null);
      if (isHovered) setHoveredNodeId(null);
    },
    [cfg.hoverHighlight, setHoveredEdgeId, setHoveredNodeId]
  );

  // Memoize SVG style to avoid recreating object
  const svgStyle = useMemo(
    () => ({
      background: mergedTheme.background,
      fontFamily: mergedTheme.fontFamily,
      cursor: dragRef.current.active ? 'grabbing' : 'grab',
    }),
    [mergedTheme.background, mergedTheme.fontFamily]
  );

  return (
    <svg
      width={cfg.width}
      height={cfg.height}
      role="figure"
      aria-label="Graph"
      style={svgStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <defs>
        <marker
          id="arrow"
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
          id="arrow-hover"
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
          id="arrow-hover-in"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={cfg.hoverNodeOutColor} />
        </marker>
      </defs>

      <g transform={`translate(${pan.x}, ${pan.y})`}>
        <GraphLabels
          positionedNodes={positionedNodes}
          layout={cfg.layout as any}
          layoutDirection={cfg.layoutDirection as any}
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
              <EdgePath
                key={edge.id}
                edge={edge}
                color={mergedTheme.edgeColor}
                width={mergedTheme.edgeWidth}
                curveEdges={cfg.curveEdges}
                curveStrength={cfg.curveStrength}
                isHovered={edgeHovered}
                hoverColor={isIncomingToHovered ? cfg.hoverNodeOutColor : cfg.hoverEdgeColor}
                hoverMarker={isIncomingToHovered ? 'url(#arrow-hover-in)' : 'url(#arrow-hover)'}
                hoverEnabled={cfg.hoverHighlight}
                hitStrokeWidth={mergedTheme.edgeWidth + 8}
                hoverStrokeWidth={mergedTheme.edgeWidth + 1.5}
                onHoverChange={(v) => handleEdgeHoverChange(edge.id, v)}
                onClick={() => onEdgeClick?.(edge)}
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
              nodeBorderColor={nodeBorderColor}
              nodeBorderWidth={nodeBorderWidth}
              hoverNodeBorderColor={hoverNodeBorderColor}
              hoverNodeBothColor={hoverNodeBothColor}
              hoverNodeInColor={cfg.hoverNodeInColor}
              hoverNodeOutColor={cfg.hoverNodeOutColor}
              hoverNodeHighlight={cfg.hoverNodeHighlight}
              hoveredNodeStates={hoveredNodeStates ?? undefined}
              onNodeClick={onNodeClick}
              onNodeMouseEnter={handleNodeMouseEnter}
              onNodeMouseLeave={handleNodeMouseLeave}
              onPathHover={handlePathHover}
              onPathLeave={handlePathLeave}
            />
          ))}
        </g>
      </g>
    </svg>
  );
});

Graph.displayName = 'Graph';

export default Graph;
