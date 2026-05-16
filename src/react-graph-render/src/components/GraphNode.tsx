import React, { useCallback } from 'react';
import type { PositionedNode, Size, VertexComponent } from '@graph-render/types';
import { useGraphNodeMeasurement } from '../hooks/useGraphNodeMeasurement';
import { getGraphNodeFrameState } from '../utils/graphNodeFrame';
import { GraphNodeFrame } from './GraphNodeFrame';
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_RADIUS, DEFAULT_NODE_WIDTH } from '../constants/graph';

interface GraphNodeProps {
  node: PositionedNode;
  Vertex: VertexComponent;
  isSelected: boolean;
  isFocused: boolean;
  isHighlighted: boolean;
  activePathKey?: string;
  activePathNodeIds?: Set<string>;
  highlightColor: string;
  selectionColor: string;
  nodeBorderColor?: string;
  nodeBorderWidth: number;
  hoverNodeBorderColor: string;
  hoverNodeBothColor: string;
  hoverNodeInColor: string;
  hoverNodeOutColor: string;
  hoverNodeHighlight: boolean;
  hoveredNodeStates: Map<string, { in?: boolean; out?: boolean }> | undefined;
  onNodeMeasure?: (nodeId: string, size: Size) => void;
  onNodeFocus?: (nodeId: string) => void;
  onNodeClick?: (node: PositionedNode) => void;
  onNodeDoubleClick?: (node: PositionedNode) => void;
  onNodeMouseEnter: (nodeId: string) => void;
  onNodeMouseLeave: () => void;
  onPathHover: (nodeId: string, sourceIndex: number, playerKey?: string) => void;
  onPathLeave: () => void;
}

export const GraphNode = React.memo<GraphNodeProps>(
  ({
    node,
    Vertex,
    isSelected,
    isFocused,
    selectionColor,
    isHighlighted,
    activePathKey,
    activePathNodeIds,
    highlightColor,
    nodeBorderColor,
    nodeBorderWidth,
    hoverNodeBorderColor,
    hoverNodeBothColor,
    hoverNodeInColor,
    hoverNodeOutColor,
    hoverNodeHighlight,
    hoveredNodeStates,
    onNodeMeasure,
    onNodeFocus,
    onNodeClick,
    onNodeDoubleClick,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onPathHover,
    onPathLeave,
  }) => {
    const width = node.size?.width ?? DEFAULT_NODE_WIDTH;
    const height = node.size?.height ?? DEFAULT_NODE_HEIGHT;
    const radius = DEFAULT_NODE_RADIUS;
    const hoverState = hoveredNodeStates?.get(node.id);
    const isHoveredIn = hoverState?.in ?? false;
    const isHoveredOut = hoverState?.out ?? false;
    const groupRef = useGraphNodeMeasurement({ node, width, height, onNodeMeasure });
    const { borderOpacity, borderStroke, borderWidth, isHoveredBoth, isHoveredNode } =
      getGraphNodeFrameState({
        isSelected,
        isHighlighted,
        highlightColor,
        selectionColor,
        nodeBorderColor,
        nodeBorderWidth,
        hoverNodeBorderColor,
        hoverNodeBothColor,
        hoverNodeInColor,
        hoverNodeOutColor,
        hoverNodeHighlight,
        isHoveredIn,
        isHoveredOut,
      });
    const focusStrokeWidth = isFocused ? Math.max(2, borderWidth || 2) : 0;

    const handleMouseDown = useCallback((event: React.MouseEvent) => {
      event.preventDefault();
    }, []);

    const handleFocus = useCallback(() => {
      onNodeFocus?.(node.id);
    }, [node.id, onNodeFocus]);

    const handleClick = useCallback(() => {
      onNodeClick?.(node);
    }, [node, onNodeClick]);

    const handleDoubleClick = useCallback(() => {
      onNodeDoubleClick?.(node);
    }, [node, onNodeDoubleClick]);

    const handleMouseEnter = useCallback(() => {
      onNodeMouseEnter(node.id);
    }, [node.id, onNodeMouseEnter]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onNodeClick?.(node);
        }
      },
      [node, onNodeClick]
    );

    const handlePathHover = useCallback(
      (sourceIndex: number | null, opts?: { pathKey?: string; playerKey?: string }) => {
        if (sourceIndex !== null) {
          onPathHover(node.id, sourceIndex, opts?.pathKey ?? opts?.playerKey);
        }
      },
      [node.id, onPathHover]
    );

    return (
      <g
        ref={groupRef}
        transform={`translate(${node.position.x}, ${node.position.y})`}
        data-graph-node-interactive="true"
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
        onMouseDown={handleMouseDown}
        onFocus={handleFocus}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onNodeMouseLeave}
        onKeyDown={handleKeyDown}
      >
        <GraphNodeFrame
          width={width}
          height={height}
          radius={radius}
          borderStroke={borderStroke}
          borderOpacity={borderOpacity}
          borderWidth={borderWidth}
          isFocused={isFocused}
          selectionColor={selectionColor}
          focusStrokeWidth={focusStrokeWidth}
        />
        <Vertex
          node={node}
          isSelected={isSelected}
          isHovered={isHoveredNode}
          isHoveredIn={isHoveredIn}
          isHoveredOut={isHoveredOut}
          isHoveredBoth={isHoveredBoth}
          activePathKey={activePathKey}
          activePathNodeIds={activePathNodeIds}
          hoverInColor={hoverNodeInColor}
          hoverOutColor={hoverNodeOutColor}
          hoverBothColor={hoverNodeBothColor}
          onPathHover={handlePathHover}
          onPathLeave={onPathLeave}
        />
      </g>
    );
  }
);

GraphNode.displayName = 'GraphNode';
