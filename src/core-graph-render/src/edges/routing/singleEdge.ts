import { EdgeType, PositionedEdge } from '@graph-render/types';
import { DEFAULT_NODE_SIZE } from '../../utils';
import { calculateEdgePoints } from './edgePoints';
import { createRoutingContext } from './context';
import { calculateLabelPosition } from './label';
import { RouteSingleEdgeInput } from './types';
import { createSelfLoopPoints } from './selfLoop';
import { findConnectionSides } from './sides';

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
    return {
      ...edge,
      points,
      labelPosition: calculateLabelPosition(points),
    };
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

  return {
    ...edge,
    points,
    labelPosition: calculateLabelPosition(points),
  };
};
