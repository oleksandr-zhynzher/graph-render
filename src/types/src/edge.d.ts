import { NodeId } from './node';
import { Point } from './node';
import { EdgeType } from './config';
export type EdgeId = string;
export interface EdgeData {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  type?: EdgeType;
  label?: unknown;
  points?: Point[];
  meta?: Record<string, unknown>;
}
export interface PositionedEdge extends EdgeData {
  points: Point[];
}
//# sourceMappingURL=edge.d.ts.map
