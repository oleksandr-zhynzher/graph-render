import { PositionedNode, Size } from './node';

export enum NodeSide {
  Left = 'left',
  Right = 'right',
  Top = 'top',
  Bottom = 'bottom',
}

export interface RouteEdgesOptions {
  arrowPadding?: number;
  straight?: boolean;
  forceRightToLeft?: boolean;
}

export interface EdgeRoutingContext {
  source: PositionedNode;
  target: PositionedNode;
  sourceSize: Size;
  targetSize: Size;
  isUndirected: boolean;
  arrowPadding: number;
  straight: boolean;
  forceRightToLeft: boolean;
  otherRects: Array<{ x: number; y: number; w: number; h: number }>;
}
