import type { PositionedNode, Size, VertexComponent } from '@graph-render/types';
import React from 'react';

import { GraphNode } from './GraphNode';

interface GraphNodesLayerProps {
  readonly nodes: readonly PositionedNode[];
  readonly Vertex: VertexComponent;
  readonly selectedNodeSet: ReadonlySet<string>;
  readonly focusedNodeId: string | null;
  readonly highlightedNodeSet: ReadonlySet<string>;
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
  readonly onNodeFocus: (nodeId: string) => void;
  readonly onNodeClick: (node: PositionedNode) => void;
  readonly onNodeDoubleClick: (node: PositionedNode) => void;
  readonly onNodeMouseEnter: (nodeId: string) => void;
  readonly onNodeMouseLeave: () => void;
  readonly onPathHover: (nodeId: string, sourceIndex: number, pathKey?: string | undefined) => void;
  readonly onPathLeave: () => void;
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
