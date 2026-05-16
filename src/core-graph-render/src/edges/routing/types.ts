import {
  EdgeData,
  LayoutDirection,
  PositionedNode,
  RouteEdgesOptions,
  Size,
} from '@graph-render/types';

export type RoutingStyle = NonNullable<RouteEdgesOptions['routingStyle']>;
export type OrthogonalRoutingStyle = Extract<RoutingStyle, 'orthogonal' | 'bundled'>;

export type ParallelEdgeMeta = {
  index: number;
  total: number;
  centeredOffset: number;
};

export type RoutingContextInput = {
  source: PositionedNode;
  target: PositionedNode;
  sourceSize: Size;
  targetSize: Size;
  nodes: PositionedNode[];
  useObstacleAvoidance: boolean;
  isUndirected: boolean;
  arrowPadding: number;
  straight: boolean;
  forceRightToLeft: boolean;
  layoutDirection: LayoutDirection;
  routingStyle: RoutingStyle;
  edgeSeparation: number;
  selfLoopRadius: number;
};

export type RouteSingleEdgeInput = {
  edge: EdgeData;
  nodeMap: Map<string, PositionedNode>;
  nodes: PositionedNode[];
  useObstacleAvoidance: boolean;
  arrowPadding: number;
  straight: boolean;
  forceRightToLeft: boolean;
  layoutDirection: LayoutDirection;
  routingStyle: RoutingStyle;
  edgeSeparation: number;
  selfLoopRadius: number;
  parallelMeta: ParallelEdgeMeta;
};
