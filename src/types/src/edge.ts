import type { EdgeType } from './config';
import type { NodeId, Point } from './node';

export type EdgeId = string;

export interface EdgeData<TMeta extends object = Record<string, unknown>, TLabel = unknown> {
  readonly id: EdgeId;
  readonly source: NodeId;
  readonly target: NodeId;
  readonly type?: EdgeType | undefined;
  readonly label?: TLabel | undefined;
  readonly points?: readonly Point[] | undefined;
  readonly meta?: TMeta | undefined;
}

export interface PositionedEdge<
  TMeta extends object = Record<string, unknown>,
  TLabel = unknown,
> extends EdgeData<TMeta, TLabel> {
  readonly points: readonly Point[];
  readonly labelPosition?: Point | undefined;
}
