import type { PositionedEdge } from './edge';
import type { PositionedNode } from './node';

export type NodeRenderer<TNode extends PositionedNode = PositionedNode> = (node: TNode) => string;
export type EdgeRenderer<TEdge extends PositionedEdge = PositionedEdge> = (
  edge: TEdge,
  pathD: string,
  theme: {
    readonly edgeColor: string;
    readonly edgeWidth: number;
    readonly markerId: string;
    readonly edgeLabelColor: string;
  }
) => string;
