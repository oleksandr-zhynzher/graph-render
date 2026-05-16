import {
  type EdgeRoutingContext,
  NodeSide,
  type PositionedNode,
  type Size,
} from '@graph-render/types';

import { getNodeCenter } from '../geometry';
import {
  applyDirectionalPreference,
  findNonIntersectingSides,
  sortSidesByDistance,
} from '../sideSelection';

/**
 * Find the best connection sides between source and target nodes
 */
export const findConnectionSides = (
  source: PositionedNode,
  target: PositionedNode,
  sourceSize: Size,
  targetSize: Size,
  context: EdgeRoutingContext,
  isDirected: boolean
): { readonly sourceSide: NodeSide; readonly targetSide: NodeSide } => {
  if (context.forceRightToLeft) {
    return { sourceSide: NodeSide.Right, targetSide: NodeSide.Left };
  }

  const srcCenter = getNodeCenter(source, sourceSize);
  const tgtCenter = getNodeCenter(target, targetSize);
  const sortedTargetSides = sortSidesByDistance(target, targetSize, srcCenter);
  const sortedSourceSides = applyDirectionalPreference(
    sortSidesByDistance(source, sourceSize, tgtCenter),
    isDirected,
    context.layoutDirection
  );

  return findNonIntersectingSides(context, sortedSourceSides, sortedTargetSides);
};
