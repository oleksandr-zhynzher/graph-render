import { NodeData, EdgeData, PositionedNode, LayoutDirection } from '@graph-render/types';
import { DEFAULT_PADDING, DEFAULT_NODE_GAP } from '../utils/constants';
import {
  buildGraphTopology,
  findRootNodes,
  assignNodesToLevels,
  groupNodesByLevel,
} from './treeTopology';
import { calculateTreeMetrics } from './treePositioning';
import { positionNodesInLevels, alignNodesToParents } from './treeAlignment';

/**
 * Layout nodes in a tree/hierarchical structure
 */
export function treeLayout(
  nodes: NodeData[],
  edges: EdgeData[],
  pad: number = DEFAULT_PADDING,
  gap: number = DEFAULT_NODE_GAP,
  direction: LayoutDirection = LayoutDirection.LTR,
  containerHeight?: number
): PositionedNode[] {
  const { incoming, outgoing } = buildGraphTopology(edges);
  const rootIds = findRootNodes(nodes, incoming);
  const levelMap = assignNodesToLevels(nodes, rootIds, outgoing);
  const levels = groupNodesByLevel(nodes, levelMap, rootIds);
  const metrics = calculateTreeMetrics(nodes, levels, gap, pad, containerHeight);

  const positioned = positionNodesInLevels(nodes, levels, levelMap, metrics, gap, pad, direction);

  return alignNodesToParents(positioned, edges, levels, metrics.maxLevel);
}
