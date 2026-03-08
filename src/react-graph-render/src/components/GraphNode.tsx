import React, { useLayoutEffect, useRef } from 'react';
import { PositionedNode, Size, VertexComponent } from '@graph-render/types';

interface GraphNodeProps {
  node: PositionedNode;
  Vertex: VertexComponent;
  isSelected: boolean;
  isFocused: boolean;
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
    const groupRef = useRef<SVGGElement>(null);
    const width = node.size?.width ?? 180;
    const height = node.size?.height ?? 72;
    const radius = 8;
    const hoverState = hoveredNodeStates?.get(node.id);
    const isHoveredIn = hoverState?.in ?? false;
    const isHoveredOut = hoverState?.out ?? false;
    const isHoveredBoth = isHoveredIn && isHoveredOut;
    const isHoveredNode = isHoveredIn || isHoveredOut;
    const hasBorder = (!!nodeBorderColor && nodeBorderWidth > 0) || isSelected;

    let borderStroke = nodeBorderColor;
    if (isSelected) {
      borderStroke = selectionColor;
    } else if (!hasBorder) {
      borderStroke = 'none';
    } else if (hoverNodeHighlight) {
      if (isHoveredBoth) {
        borderStroke = hoverNodeBothColor;
      } else if (isHoveredOut) {
        borderStroke = hoverNodeOutColor;
      } else if (isHoveredIn) {
        borderStroke = hoverNodeInColor;
      } else if (isHoveredNode) {
        borderStroke = hoverNodeBorderColor;
      }
    }

    let borderOpacity = 0;
    if (isSelected) {
      borderOpacity = 1;
    } else if (hasBorder) {
      borderOpacity = hoverNodeHighlight && isHoveredNode ? 1 : 0.4;
    }

    useLayoutEffect(() => {
      if (!groupRef.current || !onNodeMeasure) {
        return;
      }

      const frame = requestAnimationFrame(() => {
        try {
          const bounds = groupRef.current?.getBBox();
          if (bounds && bounds.width > 0 && bounds.height > 0) {
            onNodeMeasure(node.id, {
              width: Math.ceil(bounds.width),
              height: Math.ceil(bounds.height),
            });
          }
        } catch {
          // Ignore measurement failures in unsupported environments.
        }
      });

      return () => cancelAnimationFrame(frame);
    }, [node.id, node.label, node.meta, onNodeMeasure, width, height, isSelected, isHoveredNode]);

    const borderWidth = isSelected ? Math.max(2, nodeBorderWidth) : hasBorder ? nodeBorderWidth : 0;
    const focusStrokeWidth = isFocused ? Math.max(2, borderWidth || 2) : 0;

    return (
      <g
        ref={groupRef}
        transform={`translate(${node.position.x}, ${node.position.y})`}
        data-graph-node-interactive="true"
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
        onFocus={() => onNodeFocus?.(node.id)}
        onClick={() => onNodeClick?.(node)}
        onDoubleClick={() => onNodeDoubleClick?.(node)}
        onMouseEnter={() => onNodeMouseEnter(node.id)}
        onMouseLeave={onNodeMouseLeave}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onNodeClick?.(node);
          }
        }}
      >
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={radius}
          ry={radius}
          fill="none"
          stroke={borderStroke}
          strokeOpacity={borderOpacity}
          strokeWidth={borderWidth}
          pointerEvents="none"
        />
        {isFocused ? (
          <rect
            x={-3}
            y={-3}
            width={width + 6}
            height={height + 6}
            rx={radius + 2}
            ry={radius + 2}
            fill="none"
            stroke={selectionColor}
            strokeOpacity={0.7}
            strokeWidth={focusStrokeWidth}
            strokeDasharray="4 3"
            pointerEvents="none"
          />
        ) : null}
        <Vertex
          node={node}
          isSelected={isSelected}
          isHovered={isHoveredNode}
          isHoveredIn={isHoveredIn}
          isHoveredOut={isHoveredOut}
          isHoveredBoth={isHoveredBoth}
          hoverInColor={hoverNodeInColor}
          hoverOutColor={hoverNodeOutColor}
          hoverBothColor={hoverNodeBothColor}
          onPathHover={(sourceIndex, opts) =>
            sourceIndex !== null &&
            onPathHover(node.id, sourceIndex, opts?.pathKey ?? opts?.playerKey)
          }
          onPathLeave={onPathLeave}
        />
      </g>
    );
  }
);

GraphNode.displayName = 'GraphNode';
