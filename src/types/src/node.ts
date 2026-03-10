export type NodeId = string;

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type NodeSizingMode = 'fixed' | 'label' | 'measured';

export interface NodeMeasurementHints {
  label?: string;
  paddingX?: number;
  paddingY?: number;
  estimatedCharWidth?: number;
  lineHeight?: number;
}

export interface NodeData<
  TData = unknown,
  TMeta extends object = Record<string, unknown>,
  TLabel = unknown,
> {
  id: NodeId;
  label?: TLabel;
  position?: Point;
  size?: Size;
  measuredSize?: Size;
  sizeMode?: NodeSizingMode;
  measurementHints?: NodeMeasurementHints;
  data?: TData;
  meta?: TMeta;
}

export interface PositionedNode<
  TData = unknown,
  TMeta extends object = Record<string, unknown>,
  TLabel = unknown,
> extends NodeData<TData, TMeta, TLabel> {
  position: Point;
}
