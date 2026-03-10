import { NodeId } from './node';
import { Point } from './node';
import { EdgeType } from './config';

export type EdgeId = string;

export interface EdgeData<
  TMeta extends object = Record<string, unknown>,
  TLabel = unknown,
> {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  type?: EdgeType;
  label?: TLabel;
  points?: Point[];
  meta?: TMeta;
}

export interface PositionedEdge<
  TMeta extends object = Record<string, unknown>,
  TLabel = unknown,
> extends EdgeData<TMeta, TLabel> {
  points: Point[];
  labelPosition?: Point;
}
