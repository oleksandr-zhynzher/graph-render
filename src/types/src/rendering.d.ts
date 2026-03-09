import { PositionedNode } from './node';
import { PositionedEdge } from './edge';
export type NodeRenderer = (node: PositionedNode) => string;
export type EdgeRenderer = (
  edge: PositionedEdge,
  pathD: string,
  theme: {
    edgeColor: string;
    edgeWidth: number;
    markerId: string;
  }
) => string;
//# sourceMappingURL=rendering.d.ts.map
