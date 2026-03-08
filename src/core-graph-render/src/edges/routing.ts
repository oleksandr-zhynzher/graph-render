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
  LayoutDirection,
} from '@graph-render/types';
import { DEFAULT_NODE_SIZE } from '../utils';
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

type ParallelEdgeMeta = {
  index: number;
  total: number;
  centeredOffset: number;
};

const ORTHOGONAL_TERMINAL_SEGMENT = 20;

const getParallelGroupKey = (edge: EdgeData): string => {
  const pair = [edge.source, edge.target].sort().join('|');
  return `${pair}|${edge.type ?? EdgeType.Directed}`;
};

const buildParallelEdgeIndex = (edges: EdgeData[]): Map<string, ParallelEdgeMeta> => {
  const groups = new Map<string, EdgeData[]>();

  edges.forEach((edge) => {
    const key = getParallelGroupKey(edge);
    groups.set(key, [...(groups.get(key) ?? []), edge]);
  });

  const meta = new Map<string, ParallelEdgeMeta>();
  groups.forEach((group) => {
    const total = group.length;
    group.forEach((edge, index) => {
      meta.set(edge.id, {
        index,
        total,
        centeredOffset: index - (total - 1) / 2,
      });
    });
  });

  return meta;
};

const calculateLabelPosition = (points: Point[]): Point | undefined => {
  if (points.length < 2) {
    return undefined;
  }

  const segmentLengths = points.slice(1).map((point, index) => {
    const previous = points[index];
    return Math.hypot(point.x - previous.x, point.y - previous.y);
  });
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);
  const halfway = totalLength / 2;
  let traversed = 0;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index];
    if (traversed + length >= halfway) {
      const start = points[index];
      const end = points[index + 1];
      const ratio = length === 0 ? 0 : (halfway - traversed) / length;
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      };
    }
    traversed += length;
  }

  return points[Math.floor(points.length / 2)];
};

const createSelfLoopPoints = (
  node: PositionedNode,
  size: Size,
  loopRadius: number,
  offset: number
): Point[] => {
  const right = node.position.x + size.width;
  const top = node.position.y;
  const anchorX = right - Math.min(size.width * 0.2, 16);
  const anchorY = top + Math.min(size.height * 0.3, 20);
  const loopX = right + loopRadius + offset;
  const loopTop = top - loopRadius - Math.abs(offset) * 0.4;
  const loopBottom = top + size.height * 0.75 + Math.abs(offset) * 0.3;

  return [
    { x: anchorX, y: anchorY },
    { x: loopX * 0.92, y: loopTop },
    { x: loopX, y: loopTop },
    { x: loopX, y: loopBottom },
    { x: anchorX, y: top + size.height * 0.82 },
  ];
};

const applyParallelOffset = (
  points: Point[],
  sourceCenter: Point,
  targetCenter: Point,
  offset: number
): Point[] => {
  if (Math.abs(offset) < 0.01) {
    return points;
  }

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const normal = { x: -dy / distance, y: dx / distance };

  return points.map((point) => ({
    x: point.x + normal.x * offset,
    y: point.y + normal.y * offset,
  }));
};

const calculateOrthogonalPoints = (
  startPoint: Point,
  endPoint: Point,
  sourceCenter: Point,
  targetCenter: Point,
  routingStyle: 'orthogonal' | 'bundled',
  parallelOffset: number,
  sourceSide: NodeSide,
  targetSide: NodeSide
): Point[] => {
  const sourceNormal = getSideNormal(sourceSide);
  const targetNormal = getSideNormal(targetSide);
  const startLead = {
    x: startPoint.x + sourceNormal.x * ORTHOGONAL_TERMINAL_SEGMENT,
    y: startPoint.y + sourceNormal.y * ORTHOGONAL_TERMINAL_SEGMENT,
  };
  const endLead = {
    x: endPoint.x + targetNormal.x * ORTHOGONAL_TERMINAL_SEGMENT,
    y: endPoint.y + targetNormal.y * ORTHOGONAL_TERMINAL_SEGMENT,
  };
  const dx = endLead.x - startLead.x;
  const dy = endLead.y - startLead.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const midX =
      routingStyle === 'bundled'
        ? (sourceCenter.x + targetCenter.x) / 2 + parallelOffset * 0.5
        : startLead.x + dx / 2;

    return [
      startPoint,
      startLead,
      { x: midX, y: startLead.y },
      { x: midX, y: endLead.y },
      endLead,
      endPoint,
    ];
  }

  const midY =
    routingStyle === 'bundled'
      ? (sourceCenter.y + targetCenter.y) / 2 + parallelOffset * 0.5
      : startLead.y + dy / 2;

  return [
    startPoint,
    startLead,
    { x: startLead.x, y: midY },
    { x: endLead.x, y: midY },
    endLead,
    endPoint,
  ];
};

/**
 * Create routing context for an edge
 */
const createRoutingContext = (
  source: PositionedNode,
  target: PositionedNode,
  sourceSize: Size,
  targetSize: Size,
  nodes: PositionedNode[],
  isUndirected: boolean,
  arrowPadding: number,
  straight: boolean,
  forceRightToLeft: boolean,
  layoutDirection: LayoutDirection,
  routingStyle: 'smart' | 'orthogonal' | 'bundled',
  edgeSeparation: number,
  selfLoopRadius: number
): EdgeRoutingContext => {
  return {
    source,
    target,
    sourceSize,
    targetSize,
    isUndirected,
    arrowPadding,
    straight,
    forceRightToLeft,
    layoutDirection,
    routingStyle,
    edgeSeparation,
    selfLoopRadius,
    otherRects: nodes
      .filter((n) => n.id !== source.id && n.id !== target.id)
      .map((n) => ({
        x: n.position.x,
        y: n.position.y,
        w: n.size?.width ?? DEFAULT_NODE_SIZE.width,
        h: n.size?.height ?? DEFAULT_NODE_SIZE.height,
      })),
  };
};

/**
 * Find the best connection sides between source and target nodes
 */
const findConnectionSides = (
  source: PositionedNode,
  target: PositionedNode,
  sourceSize: Size,
  targetSize: Size,
  context: EdgeRoutingContext,
  isDirected: boolean
): { sourceSide: NodeSide; targetSide: NodeSide } => {
  // If forceRightToLeft is enabled, always use right side for source and left side for target
  if (context.forceRightToLeft) {
    return { sourceSide: NodeSide.Right, targetSide: NodeSide.Left };
  }

  const srcCenter = getNodeCenter(source, sourceSize);
  const tgtCenter = getNodeCenter(target, targetSize);

  const sortedTargetSides = sortSidesByDistance(target, targetSize, srcCenter);
  const sortedSourceSidesBase = sortSidesByDistance(source, sourceSize, tgtCenter);
  const sortedSourceSides = applyDirectionalPreference(
    sortedSourceSidesBase,
    isDirected,
    context.layoutDirection
  );

  return findNonIntersectingSides(context, sortedSourceSides, sortedTargetSides);
};

/**
 * Calculate edge path points based on connection sides
 */
const calculateEdgePoints = (
  source: PositionedNode,
  target: PositionedNode,
  sourceSize: Size,
  targetSize: Size,
  sourceSide: NodeSide,
  targetSide: NodeSide,
  isUndirected: boolean,
  arrowPadding: number,
  straight: boolean,
  routingStyle: 'smart' | 'orthogonal' | 'bundled',
  parallelOffset: number
): Point[] => {
  const targetInset = isUndirected ? 0 : arrowPadding;
  const startPoint = getAnchorPoint(source, sourceSize, sourceSide, 0, 0);
  const endPoint = getAnchorPoint(target, targetSize, targetSide, 0, targetInset);
  const sourceCenter = getNodeCenter(source, sourceSize);
  const targetCenter = getNodeCenter(target, targetSize);

  if (routingStyle === 'orthogonal' || routingStyle === 'bundled') {
    return calculateOrthogonalPoints(
      startPoint,
      endPoint,
      sourceCenter,
      targetCenter,
      routingStyle,
      parallelOffset,
      sourceSide,
      targetSide
    );
  }

  const sourceNormal = getSideNormal(sourceSide);
  const targetNormal = getSideInwardNormal(targetSide);
  const leadOut = getLeadOutDistance(straight, isUndirected);

  const points = straight
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

  return applyParallelOffset(points, sourceCenter, targetCenter, parallelOffset);
};

/**
 * Route a single edge between two nodes
 */
const routeSingleEdge = (
  edge: EdgeData,
  nodeMap: Map<string, PositionedNode>,
  nodes: PositionedNode[],
  arrowPadding: number,
  straight: boolean,
  forceRightToLeft: boolean,
  layoutDirection: LayoutDirection,
  routingStyle: 'smart' | 'orthogonal' | 'bundled',
  edgeSeparation: number,
  selfLoopRadius: number,
  parallelMeta: ParallelEdgeMeta
): PositionedEdge => {
  const source = nodeMap.get(edge.source);
  const target = nodeMap.get(edge.target);

  if (!source || !target) {
    return { ...edge, points: edge.points ?? [] };
  }

  const isUndirected = edge.type === EdgeType.Undirected;
  const isDirected = edge.type === EdgeType.Directed;
  const sourceSize = source.size ?? DEFAULT_NODE_SIZE;
  const targetSize = target.size ?? DEFAULT_NODE_SIZE;
  const parallelOffset = parallelMeta.centeredOffset * edgeSeparation;

  if (source.id === target.id) {
    const points = createSelfLoopPoints(source, sourceSize, selfLoopRadius, parallelOffset);
    return {
      ...edge,
      points: edge.points ?? points,
      labelPosition: calculateLabelPosition(edge.points ?? points),
    };
  }

  const context = createRoutingContext(
    source,
    target,
    sourceSize,
    targetSize,
    nodes,
    isUndirected,
    arrowPadding,
    straight,
    forceRightToLeft,
    layoutDirection,
    routingStyle,
    edgeSeparation,
    selfLoopRadius
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

/**
 * Route edges between nodes, calculating the path points for each edge
 */
export const routeEdges = (
  nodes: PositionedNode[],
  edges: EdgeData[],
  opts?: RouteEdgesOptions
): PositionedEdge[] => {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const arrowPadding = Math.max(2, opts?.arrowPadding ?? 6);
  const straight = opts?.straight ?? false;
  const forceRightToLeft = opts?.forceRightToLeft ?? false;
  const layoutDirection = opts?.layoutDirection ?? LayoutDirection.LTR;
  const routingStyle = opts?.routingStyle ?? 'smart';
  const edgeSeparation = Math.max(6, opts?.edgeSeparation ?? 18);
  const selfLoopRadius = Math.max(12, opts?.selfLoopRadius ?? 32);
  const parallelIndex = buildParallelEdgeIndex(edges);

  return edges.map((edge) =>
    routeSingleEdge(
      edge,
      nodeMap,
      nodes,
      arrowPadding,
      straight,
      forceRightToLeft,
      layoutDirection,
      routingStyle,
      edgeSeparation,
      selfLoopRadius,
      parallelIndex.get(edge.id) ?? { index: 0, total: 1, centeredOffset: 0 }
    )
  );
};
