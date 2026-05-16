import { NodeSide, Point, PositionedNode, Size } from '@graph-render/types';
import { getAnchorPoint, getNodeCenter, getSideInwardNormal, getSideNormal } from '../geometry';
import {
  calculateControlPoints,
  calculateStraightPoints,
  getLeadOutDistance,
} from '../pathCalculation';
import { calculateOrthogonalPoints } from './orthogonal';
import { RoutingStyle } from './types';

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

/**
 * Calculate edge path points based on connection sides
 */
export const calculateEdgePoints = (
  source: PositionedNode,
  target: PositionedNode,
  sourceSize: Size,
  targetSize: Size,
  sourceSide: NodeSide,
  targetSide: NodeSide,
  isUndirected: boolean,
  arrowPadding: number,
  straight: boolean,
  routingStyle: RoutingStyle,
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
