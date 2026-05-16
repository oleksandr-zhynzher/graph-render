import {
  type EdgeData,
  LayoutDirection,
  type NodeData,
  type PositionedNode,
} from '@graph-render/types';

import { DEFAULT_NODE_GAP, DEFAULT_PADDING } from '../utils';
import { alignNodesToParents, positionNodesInLevels } from './treeAlignment';
import { calculateTreeMetrics } from './treePositioning';
import {
  assertHierarchicalGraph,
  assignNodesToLevels,
  buildGraphTopology,
  findRootNodes,
  groupNodesByLevel,
} from './treeTopology';

/**
 * Layout nodes in a tree/hierarchical structure
 */
export const treeLayout = (
  nodes: readonly NodeData[],
  edges: readonly EdgeData[],
  pad: number = DEFAULT_PADDING,
  gap: number = DEFAULT_NODE_GAP,
  direction: LayoutDirection = LayoutDirection.LTR,
  containerHeight?: number
): readonly PositionedNode[] => {
  assertHierarchicalGraph(nodes, edges);

  const { incoming, outgoing } = buildGraphTopology(edges);
  const rootIds = findRootNodes(nodes, incoming);
  const levelMap = assignNodesToLevels(nodes, rootIds, outgoing);
  const levels = groupNodesByLevel(nodes, levelMap);
  const metrics = calculateTreeMetrics(nodes, levels, gap, pad, containerHeight);

  const positioned = positionNodesInLevels(nodes, levels, levelMap, metrics, gap, pad, direction);

  return alignNodesToParents(positioned, edges, levels, metrics.maxLevel);
};
