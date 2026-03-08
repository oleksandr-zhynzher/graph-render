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

export interface NodeData {
  id: NodeId;
  label?: unknown;
  position?: Point;
  size?: Size;
  measuredSize?: Size;
  sizeMode?: NodeSizingMode;
  measurementHints?: NodeMeasurementHints;
  data?: unknown;
  meta?: Record<string, unknown>;
}

export interface PositionedNode extends NodeData {
  position: Point;
}
