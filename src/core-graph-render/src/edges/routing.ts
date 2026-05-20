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

const finiteAtLeast = (value: number | undefined, fallback: number, min: number): number => {
  const candidate = value !== undefined && Number.isFinite(value) ? value : fallback;
  return Math.max(min, candidate);
};

/**
 * Route edges between nodes, calculating the path points for each edge
 */
export const routeEdges = (
  nodes: readonly PositionedNode[],
  edges: readonly EdgeData[],
  opts?: RouteEdgesOptions
): readonly PositionedEdge[] => {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const arrowPadding = finiteAtLeast(opts?.arrowPadding, 6, 2);
  const straight = opts?.straight ?? false;
  const forceRightToLeft = opts?.forceRightToLeft ?? false;
  const layoutDirection = opts?.layoutDirection ?? LayoutDirection.LTR;
  const routingStyle = opts?.routingStyle ?? RoutingStyle.Smart;
  const edgeSeparation = finiteAtLeast(opts?.edgeSeparation, 18, 6);
  const selfLoopRadius = finiteAtLeast(opts?.selfLoopRadius, 32, 12);
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
