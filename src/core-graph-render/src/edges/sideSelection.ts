import {
  type EdgeRoutingContext,
  LayoutDirection,
  NodeSide,
  type Point,
  type PositionedNode,
  type Size,
} from '@graph-render/types';

import { segmentIntersectsRect } from './collision';
import { getSideCenter } from './geometry';

/**
 * Sort node sides by distance to a target point
 */
export const sortSidesByDistance = (
  node: PositionedNode,
  size: Size,
  targetPoint: Point
): readonly NodeSide[] => {
  const sides: NodeSide[] = [NodeSide.Left, NodeSide.Right, NodeSide.Top, NodeSide.Bottom];
  return [...sides].sort((a, b) => {
    const ca = getSideCenter(node, size, a);
    const cb = getSideCenter(node, size, b);
    const da = Math.hypot(ca.x - targetPoint.x, ca.y - targetPoint.y);
    const db = Math.hypot(cb.x - targetPoint.x, cb.y - targetPoint.y);
    return da - db;
  });
};

/**
 * Apply directional preference for source sides based on layout flow.
 */
export const applyDirectionalPreference = (
  sides: readonly NodeSide[],
  isDirected: boolean,
  layoutDirection: LayoutDirection = LayoutDirection.LTR
): readonly NodeSide[] => {
  if (!isDirected) return sides;

  const preferredSide = layoutDirection === LayoutDirection.RTL ? NodeSide.Left : NodeSide.Right;

  return [...sides].sort((a, b) => {
    const weight = (side: NodeSide) => (side === preferredSide ? 0 : 1);
    return weight(a) - weight(b);
  });
};

/**
 * Find the best non-intersecting pair of sides between source and target
 */
export const findNonIntersectingSides = (
  context: EdgeRoutingContext,
  sortedSourceSides: readonly NodeSide[],
  sortedTargetSides: readonly NodeSide[]
): { readonly sourceSide: NodeSide; readonly targetSide: NodeSide } => {
  for (const s of sortedSourceSides) {
    for (const t of sortedTargetSides) {
      const start = getSideCenter(context.source, context.sourceSize, s);
      const end = getSideCenter(context.target, context.targetSize, t);
      if (!context.otherRects.some((r) => segmentIntersectsRect(start, end, r))) {
        return { sourceSide: s, targetSide: t };
      }
    }
  }
  // Return first options if no non-intersecting pair found
  return {
    sourceSide: sortedSourceSides[0] ?? NodeSide.Right,
    targetSide: sortedTargetSides[0] ?? NodeSide.Left,
  };
};
