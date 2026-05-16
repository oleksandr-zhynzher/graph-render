export type NodeId = string;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

export enum NodeSizingMode {
  Fixed = 'fixed',
  Label = 'label',
  Measured = 'measured',
}

export interface NodeMeasurementHints {
  readonly label?: string | undefined;
  readonly paddingX?: number | undefined;
  readonly paddingY?: number | undefined;
  readonly estimatedCharWidth?: number | undefined;
  readonly lineHeight?: number | undefined;
}

export interface NodeData<
  TData = unknown,
  TMeta extends object = Record<string, unknown>,
  TLabel = unknown,
> {
  readonly id: NodeId;
  readonly label?: TLabel | undefined;
  readonly position?: Point | undefined;
  readonly size?: Size | undefined;
  readonly measuredSize?: Size | undefined;
  readonly sizeMode?: NodeSizingMode | undefined;
  readonly measurementHints?: NodeMeasurementHints | undefined;
  readonly data?: TData | undefined;
  readonly meta?: TMeta | undefined;
}

export interface PositionedNode<
  TData = unknown,
  TMeta extends object = Record<string, unknown>,
  TLabel = unknown,
> extends NodeData<TData, TMeta, TLabel> {
  readonly position: Point;
}
