import type { LayoutDirection, RoutingStyle } from './config';
import type { PositionedNode, Size } from './node';

export enum NodeSide {
  Left = 'left',
  Right = 'right',
  Top = 'top',
  Bottom = 'bottom',
}

export interface RouteEdgesOptions {
  readonly arrowPadding?: number | undefined;
  readonly straight?: boolean | undefined;
  readonly forceRightToLeft?: boolean | undefined;
  readonly layoutDirection?: LayoutDirection | undefined;
  readonly routingStyle?: RoutingStyle | undefined;
  readonly edgeSeparation?: number | undefined;
  readonly selfLoopRadius?: number | undefined;
}

export interface EdgeRoutingContext {
  readonly source: PositionedNode;
  readonly target: PositionedNode;
  readonly sourceSize: Size;
  readonly targetSize: Size;
  readonly isUndirected: boolean;
  readonly arrowPadding: number;
  readonly straight: boolean;
  readonly forceRightToLeft: boolean;
  readonly layoutDirection: LayoutDirection;
  readonly routingStyle: RoutingStyle;
  readonly edgeSeparation: number;
  readonly selfLoopRadius: number;
  readonly otherRects: ReadonlyArray<{
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
  }>;
}
