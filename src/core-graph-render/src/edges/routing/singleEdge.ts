import { EdgeType, type PositionedEdge } from '@graph-render/types';

import { DEFAULT_NODE_SIZE } from '../../utils';
import { createRoutingContext } from './context';
import { calculateEdgePoints } from './edgePoints';
import { calculateLabelPosition } from './label';
import { createSelfLoopPoints } from './selfLoop';
import { findConnectionSides } from './sides';
import type { RouteSingleEdgeInput } from './types';

const toPositionedEdge = (edge: PositionedEdge): PositionedEdge => {
  const labelPosition = calculateLabelPosition(edge.points);
  return labelPosition ? { ...edge, labelPosition } : edge;
};

/**
 * Route a single edge between two nodes
 */
export const routeSingleEdge = ({
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
  parallelMeta,
}: RouteSingleEdgeInput): PositionedEdge => {
  const source = nodeMap.get(edge.source);
  const target = nodeMap.get(edge.target);

  if (!source || !target) {
    throw new Error(
      `Cannot route edge "${edge.id}" because endpoint nodes are missing. Source: "${edge.source}", target: "${edge.target}".`
    );
  }

  const isUndirected = edge.type === EdgeType.Undirected;
  const isDirected = edge.type === EdgeType.Directed;
  const sourceSize = source.size ?? DEFAULT_NODE_SIZE;
  const targetSize = target.size ?? DEFAULT_NODE_SIZE;
  const parallelOffset = parallelMeta.centeredOffset * edgeSeparation;

  if (source.id === target.id) {
    const points =
      edge.points ?? createSelfLoopPoints(source, sourceSize, selfLoopRadius, parallelOffset);
    return toPositionedEdge({
      ...edge,
      points,
    });
  }

  const context = createRoutingContext({
    source,
    target,
    sourceSize,
    targetSize,
    nodes,
    useObstacleAvoidance,
    isUndirected,
    arrowPadding,
    straight,
    forceRightToLeft,
    layoutDirection,
    routingStyle,
    edgeSeparation,
    selfLoopRadius,
  });

  const { sourceSide, targetSide } = findConnectionSides(
    source,
    target,
    sourceSize,
    targetSize,
    context,
    isDirected
  );

  const defaultPoints = calculateEdgePoints(
    source,
    target,
    sourceSize,
    targetSize,
    sourceSide,
    targetSide,
    isUndirected,
    arrowPadding,
    straight,
    routingStyle,
    parallelOffset
  );
  const points = edge.points ?? defaultPoints;

  return toPositionedEdge({
    ...edge,
    points,
  });
};
