import React from 'react';
import { PositionedNode, VertexComponent } from '@graph-render/types';

interface GraphNodeProps {
  node: PositionedNode;
  Vertex: VertexComponent;
  nodeBorderColor?: string;
  nodeBorderWidth: number;
  hoverNodeBorderColor: string;
  hoverNodeBothColor: string;
  hoverNodeInColor: string;
  hoverNodeOutColor: string;
  hoverNodeHighlight: boolean;
  hoveredNodeStates: Map<string, { in?: boolean; out?: boolean }> | undefined;
  onNodeClick?: (node: PositionedNode) => void;
  onNodeMouseEnter: (nodeId: string) => void;
  onNodeMouseLeave: () => void;
  onPathHover: (nodeId: string, sourceIndex: number, playerKey?: string) => void;
  onPathLeave: () => void;
}

export const GraphNode = React.memo<GraphNodeProps>(
  ({
    node,
    Vertex,
    nodeBorderColor,
    nodeBorderWidth,
    hoverNodeBorderColor,
    hoverNodeBothColor,
    hoverNodeInColor,
    hoverNodeOutColor,
    hoverNodeHighlight,
    hoveredNodeStates,
    onNodeClick,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onPathHover,
    onPathLeave,
  }) => {
    const width = node.size?.width ?? 180;
    const height = node.size?.height ?? 72;
    const radius = 8;
    const hoverState = hoveredNodeStates?.get(node.id);
    const isHoveredIn = hoverState?.in ?? false;
    const isHoveredOut = hoverState?.out ?? false;
    const isHoveredBoth = isHoveredIn && isHoveredOut;
    const isHoveredNode = isHoveredIn || isHoveredOut;
    const hasBorder = !!nodeBorderColor && nodeBorderWidth > 0;

    const borderStroke = !hasBorder
      ? 'none'
      : hoverNodeHighlight
        ? isHoveredBoth
          ? hoverNodeBothColor
          : isHoveredOut
            ? hoverNodeOutColor
            : isHoveredIn
              ? hoverNodeInColor
              : isHoveredNode
                ? hoverNodeBorderColor
                : nodeBorderColor
        : nodeBorderColor;

    const borderOpacity = hasBorder ? (hoverNodeHighlight && isHoveredNode ? 1 : 0.4) : 0;

    return (
      <g
        transform={`translate(${node.position.x}, ${node.position.y})`}
        onClick={() => onNodeClick?.(node)}
        onMouseEnter={() => onNodeMouseEnter(node.id)}
        onMouseLeave={onNodeMouseLeave}
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
          strokeWidth={hasBorder ? nodeBorderWidth : 0}
          pointerEvents="none"
        />
        <Vertex
          node={node}
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
