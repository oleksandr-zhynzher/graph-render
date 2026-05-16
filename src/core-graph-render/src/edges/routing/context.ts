import { EdgeRoutingContext } from '@graph-render/types';
import { DEFAULT_NODE_SIZE } from '../../utils';
import { RoutingContextInput } from './types';

/**
 * Create routing context for an edge
 */
export const createRoutingContext = ({
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
}: RoutingContextInput): EdgeRoutingContext => ({
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
  otherRects: useObstacleAvoidance
    ? nodes
        .filter((n) => n.id !== source.id && n.id !== target.id)
        .map((n) => ({
          x: n.position.x,
          y: n.position.y,
          w: n.size?.width ?? DEFAULT_NODE_SIZE.width,
          h: n.size?.height ?? DEFAULT_NODE_SIZE.height,
        }))
    : [],
});
