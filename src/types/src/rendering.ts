import { PositionedNode } from './node';
import { PositionedEdge } from './edge';

export type NodeRenderer<TNode extends PositionedNode<any, any, any> = PositionedNode> = (
  node: TNode
) => string;
export type EdgeRenderer<TEdge extends PositionedEdge<any, any> = PositionedEdge> = (
  edge: TEdge,
  pathD: string,
  theme: { edgeColor: string; edgeWidth: number; markerId: string; edgeLabelColor: string }
) => string;
