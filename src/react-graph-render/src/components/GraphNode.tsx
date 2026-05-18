import type { PositionedNode, Size, VertexComponent } from '@graph-render/types';
import React, { useCallback } from 'react';

import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_RADIUS, DEFAULT_NODE_WIDTH } from '../constants/graph';
import { useGraphNodeMeasurement } from '../hooks/useGraphNodeMeasurement';
import { getGraphNodeFrameState } from '../utils/graphNodeFrame';
import { GraphNodeFrame } from './GraphNodeFrame';

interface GraphNodeProps {
  readonly node: PositionedNode;
  readonly Vertex: VertexComponent;
  readonly isSelected: boolean;
  readonly isFocused: boolean;
  readonly isHighlighted: boolean;
  readonly activePathKey?: string | undefined;
  readonly activePathNodeIds?: ReadonlySet<string> | undefined;
  readonly highlightColor: string;
  readonly selectionColor: string;
  readonly nodeBorderColor?: string | undefined;
  readonly nodeBorderWidth: number;
  readonly hoverNodeBorderColor: string;
  readonly hoverNodeBothColor: string;
  readonly hoverNodeInColor: string;
  readonly hoverNodeOutColor: string;
  readonly hoverNodeHighlight: boolean;
  readonly hoveredNodeStates:
    | ReadonlyMap<string, { readonly in?: boolean; readonly out?: boolean }>
    | undefined;
  readonly onNodeMeasure?: ((nodeId: string, size: Size) => void) | undefined;
  readonly onNodeFocus?: ((nodeId: string) => void) | undefined;
  readonly onNodeClick?: ((node: PositionedNode) => void) | undefined;
  readonly onNodeDoubleClick?: ((node: PositionedNode) => void) | undefined;
  readonly onNodeMouseEnter: (nodeId: string) => void;
  readonly onNodeMouseLeave: () => void;
  readonly onPathHover: (nodeId: string, sourceIndex: number, playerKey?: string) => void;
  readonly onPathLeave: () => void;
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
      (
        sourceIndex: number | null,
        opts?: { pathKey?: string | undefined; playerKey?: string | undefined }
      ) => {
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
        aria-label={typeof node.label === 'string' ? node.label : String(node.id)}
        aria-pressed={isSelected}
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
