import type {
  EdgeData,
  LayoutDirection,
  PositionedNode,
  RoutingStyle,
  Size,
} from '@graph-render/types';

export { RoutingStyle } from '@graph-render/types';

export type OrthogonalRoutingStyle = RoutingStyle.Orthogonal | RoutingStyle.Bundled;

export interface ParallelEdgeMeta {
  readonly index: number;
  readonly total: number;
  readonly centeredOffset: number;
}

export interface RoutingContextInput {
  readonly source: PositionedNode;
  readonly target: PositionedNode;
  readonly sourceSize: Size;
  readonly targetSize: Size;
  readonly nodes: readonly PositionedNode[];
  readonly useObstacleAvoidance: boolean;
  readonly isUndirected: boolean;
  readonly arrowPadding: number;
  readonly straight: boolean;
  readonly forceRightToLeft: boolean;
  readonly layoutDirection: LayoutDirection;
  readonly routingStyle: RoutingStyle;
  readonly edgeSeparation: number;
  readonly selfLoopRadius: number;
}

export interface RouteSingleEdgeInput {
  readonly edge: EdgeData;
  readonly nodeMap: ReadonlyMap<string, PositionedNode>;
  readonly nodes: readonly PositionedNode[];
  readonly useObstacleAvoidance: boolean;
  readonly arrowPadding: number;
  readonly straight: boolean;
  readonly forceRightToLeft: boolean;
  readonly layoutDirection: LayoutDirection;
  readonly routingStyle: RoutingStyle;
  readonly edgeSeparation: number;
  readonly selfLoopRadius: number;
  readonly parallelMeta: ParallelEdgeMeta;
}
