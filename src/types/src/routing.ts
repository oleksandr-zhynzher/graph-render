import { PositionedNode, Size } from './node';
import { LayoutDirection } from './config';

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
  layoutDirection?: LayoutDirection;
  routingStyle?: 'smart' | 'orthogonal' | 'bundled';
  edgeSeparation?: number;
  selfLoopRadius?: number;
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
  layoutDirection: LayoutDirection;
  routingStyle: 'smart' | 'orthogonal' | 'bundled';
  edgeSeparation: number;
  selfLoopRadius: number;
  otherRects: Array<{ x: number; y: number; w: number; h: number }>;
}
