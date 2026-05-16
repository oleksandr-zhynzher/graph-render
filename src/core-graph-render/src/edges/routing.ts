import {
  type EdgeData,
  LayoutDirection,
  type PositionedEdge,
  type PositionedNode,
  type RouteEdgesOptions,
  RoutingStyle,
} from '@graph-render/types';

import { MAX_COLLISION_SCAN_WORK } from '../utils/constants';
import { buildParallelEdgeIndex, DEFAULT_PARALLEL_EDGE_META } from './routing/parallel';
import { routeSingleEdge } from './routing/singleEdge';

/**
 * Route edges between nodes, calculating the path points for each edge
 */
export const routeEdges = (
  nodes: readonly PositionedNode[],
  edges: readonly EdgeData[],
  opts?: RouteEdgesOptions
): readonly PositionedEdge[] => {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const arrowPadding = Math.max(2, opts?.arrowPadding ?? 6);
  const straight = opts?.straight ?? false;
  const forceRightToLeft = opts?.forceRightToLeft ?? false;
  const layoutDirection = opts?.layoutDirection ?? LayoutDirection.LTR;
  const routingStyle = opts?.routingStyle ?? RoutingStyle.Smart;
  const edgeSeparation = Math.max(6, opts?.edgeSeparation ?? 18);
  const selfLoopRadius = Math.max(12, opts?.selfLoopRadius ?? 32);
  const parallelIndex = buildParallelEdgeIndex(edges);
  const useObstacleAvoidance = nodes.length * edges.length <= MAX_COLLISION_SCAN_WORK;

  return edges.map((edge) =>
    routeSingleEdge({
      edge,
      nodeMap,
      nodes,
      useObstacleAvoidance,
      arrowPadding,
      straight,
      forceRightToLeft,
      layoutDirection,
      routingStyle,
      edgeSeparation,
      selfLoopRadius,
      parallelMeta: parallelIndex.get(edge.id) ?? DEFAULT_PARALLEL_EDGE_META,
    })
  );
};
