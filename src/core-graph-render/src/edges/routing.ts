import {
  PositionedNode,
  EdgeData,
  PositionedEdge,
  RouteEdgesOptions,
  EdgeRoutingContext,
  NodeSide,
  Point,
  Size,
  EdgeType,
} from '@graph-render/types';
import { DEFAULT_NODE_SIZE } from '../utils/constants';
import { getNodeCenter, getAnchorPoint, getSideNormal, getSideInwardNormal } from './geometry';
import {
  sortSidesByDistance,
  applyDirectionalPreference,
  findNonIntersectingSides,
} from './sideSelection';
import {
  getLeadOutDistance,
  calculateControlPoints,
  calculateStraightPoints,
} from './pathCalculation';

/**
 * Create routing context for an edge
 */
function createRoutingContext(
  source: PositionedNode,
  target: PositionedNode,
  sourceSize: Size,
  targetSize: Size,
  nodes: PositionedNode[],
  isUndirected: boolean,
  arrowPadding: number,
  straight: boolean,
  forceRightToLeft: boolean
): EdgeRoutingContext {
  return {
    source,
    target,
    sourceSize,
    targetSize,
    isUndirected,
    arrowPadding,
    straight,
    forceRightToLeft,
    otherRects: nodes
      .filter((n) => n.id !== source.id && n.id !== target.id)
      .map((n) => ({
        x: n.position.x,
        y: n.position.y,
        w: n.size?.width ?? DEFAULT_NODE_SIZE.width,
        h: n.size?.height ?? DEFAULT_NODE_SIZE.height,
      })),
  };
}

/**
 * Find the best connection sides between source and target nodes
 */
function findConnectionSides(
  source: PositionedNode,
  target: PositionedNode,
  sourceSize: Size,
  targetSize: Size,
  context: EdgeRoutingContext,
  isDirected: boolean
): { sourceSide: NodeSide; targetSide: NodeSide } {
  // If forceRightToLeft is enabled, always use right side for source and left side for target
  if (context.forceRightToLeft) {
    return { sourceSide: NodeSide.Right, targetSide: NodeSide.Left };
  }

  const srcCenter = getNodeCenter(source, sourceSize);
  const tgtCenter = getNodeCenter(target, targetSize);

  const sortedTargetSides = sortSidesByDistance(target, targetSize, srcCenter);
  const sortedSourceSidesBase = sortSidesByDistance(source, sourceSize, tgtCenter);
  const sortedSourceSides = applyDirectionalPreference(sortedSourceSidesBase, isDirected);

  return findNonIntersectingSides(context, sortedSourceSides, sortedTargetSides);
}

/**
 * Calculate edge path points based on connection sides
 */
function calculateEdgePoints(
  source: PositionedNode,
  target: PositionedNode,
  sourceSize: Size,
  targetSize: Size,
  sourceSide: NodeSide,
  targetSide: NodeSide,
  isUndirected: boolean,
  arrowPadding: number,
  straight: boolean
): Point[] {
  const targetInset = isUndirected ? 0 : arrowPadding;
  const startPoint = getAnchorPoint(source, sourceSize, sourceSide, 0, 0);
  const endPoint = getAnchorPoint(target, targetSize, targetSide, 0, targetInset);

  const sourceNormal = getSideNormal(sourceSide);
  const targetNormal = getSideInwardNormal(targetSide);
  const leadOut = getLeadOutDistance(straight, isUndirected);

  return straight
    ? calculateStraightPoints(
        startPoint,
        endPoint,
        sourceNormal,
        targetNormal,
        leadOut,
        isUndirected
      )
    : calculateControlPoints(
        startPoint,
        endPoint,
        sourceNormal,
        targetNormal,
        leadOut,
        isUndirected
      );
}

/**
 * Route a single edge between two nodes
 */
function routeSingleEdge(
  edge: EdgeData,
  nodeMap: Map<string, PositionedNode>,
  nodes: PositionedNode[],
  arrowPadding: number,
  straight: boolean,
  forceRightToLeft: boolean
): PositionedEdge {
  const source = nodeMap.get(edge.source);
  const target = nodeMap.get(edge.target);

  if (!source || !target) {
    return { ...edge, points: edge.points ?? [] };
  }

  const isUndirected = edge.type === EdgeType.Undirected;
  const isDirected = edge.type === EdgeType.Directed;
  const sourceSize = source.size ?? DEFAULT_NODE_SIZE;
  const targetSize = target.size ?? DEFAULT_NODE_SIZE;

  const context = createRoutingContext(
    source,
    target,
    sourceSize,
    targetSize,
    nodes,
    isUndirected,
    arrowPadding,
    straight,
    forceRightToLeft
  );

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
    straight
  );

  return {
    ...edge,
    points: edge.points ?? defaultPoints,
  };
}

/**
 * Route edges between nodes, calculating the path points for each edge
 */
export function routeEdges(
  nodes: PositionedNode[],
  edges: EdgeData[],
  opts?: RouteEdgesOptions
): PositionedEdge[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const arrowPadding = Math.max(2, opts?.arrowPadding ?? 6);
  const straight = opts?.straight ?? false;
  const forceRightToLeft = opts?.forceRightToLeft ?? false;

  return edges.map((edge) =>
    routeSingleEdge(edge, nodeMap, nodes, arrowPadding, straight, forceRightToLeft)
  );
}
