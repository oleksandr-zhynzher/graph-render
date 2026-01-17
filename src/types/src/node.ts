export type NodeId = string;

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface NodeData {
  id: NodeId;
  label?: unknown;
  position?: Point;
  size?: Size;
  data?: unknown;
  meta?: Record<string, unknown>;
}

export interface PositionedNode extends NodeData {
  position: Point;
}
