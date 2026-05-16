import React from 'react';
import type { PositionedNode, Size, VertexComponent } from '@graph-render/types';
import { GraphNode } from './GraphNode';

interface GraphNodesLayerProps {
  nodes: PositionedNode[];
  Vertex: VertexComponent;
  selectedNodeSet: Set<string>;
  focusedNodeId: string | null;
  highlightedNodeSet: Set<string>;
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
  onNodeFocus: (nodeId: string) => void;
  onNodeClick: (node: PositionedNode) => void;
  onNodeDoubleClick: (node: PositionedNode) => void;
  onNodeMouseEnter: (nodeId: string) => void;
  onNodeMouseLeave: () => void;
  onPathHover: (nodeId: string, sourceIndex: number, pathKey?: string) => void;
  onPathLeave: () => void;
}

export const GraphNodesLayer = React.memo(function GraphNodesLayer({
  nodes,
  Vertex,
  selectedNodeSet,
  focusedNodeId,
  highlightedNodeSet,
  activePathKey,
  activePathNodeIds,
  highlightColor,
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
}: GraphNodesLayerProps) {
  return (
    <g aria-label="nodes">
      {nodes.map((node) => (
        <GraphNode
          key={node.id}
          node={node}
          Vertex={Vertex}
          isSelected={selectedNodeSet.has(node.id)}
          isFocused={focusedNodeId === node.id}
          isHighlighted={highlightedNodeSet.has(node.id)}
          activePathKey={activePathKey}
          activePathNodeIds={activePathNodeIds}
          highlightColor={highlightColor}
          selectionColor={selectionColor}
          nodeBorderColor={nodeBorderColor}
          nodeBorderWidth={nodeBorderWidth}
          hoverNodeBorderColor={hoverNodeBorderColor}
          hoverNodeBothColor={hoverNodeBothColor}
          hoverNodeInColor={hoverNodeInColor}
          hoverNodeOutColor={hoverNodeOutColor}
          hoverNodeHighlight={hoverNodeHighlight}
          hoveredNodeStates={hoveredNodeStates}
          onNodeMeasure={onNodeMeasure}
          onNodeFocus={onNodeFocus}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onPathHover={onPathHover}
          onPathLeave={onPathLeave}
        />
      ))}
    </g>
  );
});
