import { Point } from '@graph-render/types';

/**
 * Calculate the lead-out distance based on edge configuration
 */
export function getLeadOutDistance(straight: boolean, isUndirected: boolean): number {
  if (straight && !isUndirected) return 28;
  return isUndirected ? 8 : 10;
}

/**
 * Calculate control points for curved edge path
 */
export function calculateControlPoints(
  startPoint: Point,
  endPoint: Point,
  sourceNormal: Point,
  targetNormal: Point,
  leadOut: number,
  isUndirected: boolean
): Point[] {
  const outPoint = {
    x: startPoint.x + sourceNormal.x * leadOut,
    y: startPoint.y + sourceNormal.y * leadOut,
  };

  const endStraight = isUndirected ? 10 : 20;
  const endStraightStart = {
    x: endPoint.x - targetNormal.x * endStraight,
    y: endPoint.y - targetNormal.y * endStraight,
  };

  const control1 = {
    x: outPoint.x + sourceNormal.x * (leadOut * 3),
    y: outPoint.y + sourceNormal.y * (leadOut * 3),
  };

  const control2 = {
    x: endStraightStart.x - targetNormal.x * (endStraight * 3),
    y: endStraightStart.y - targetNormal.y * (endStraight * 3),
  };

  return [startPoint, outPoint, control1, control2, endStraightStart, endPoint];
}

/**
 * Calculate straight path points
 */
export function calculateStraightPoints(
  startPoint: Point,
  endPoint: Point,
  sourceNormal: Point,
  targetNormal: Point,
  leadOut: number,
  isUndirected: boolean
): Point[] {
  const outPoint = {
    x: startPoint.x + sourceNormal.x * leadOut,
    y: startPoint.y + sourceNormal.y * leadOut,
  };

  const endStraight = isUndirected ? 10 : 20;
  const endStraightStart = {
    x: endPoint.x - targetNormal.x * endStraight,
    y: endPoint.y - targetNormal.y * endStraight,
  };

  return [startPoint, outPoint, endStraightStart, endPoint];
}
