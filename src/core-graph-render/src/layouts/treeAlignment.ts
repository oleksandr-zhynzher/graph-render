import {
  NodeData,
  EdgeData,
  PositionedNode,
  TreeMetrics,
  LayoutDirection,
} from '@graph-render/types';
import { DEFAULT_NODE_SIZE } from '../utils/constants';
import { calculateXPosition, calculateYPosition } from './treePositioning';

/**
 * Position all nodes initially based on their level
 */
export function positionNodesInLevels(
  nodes: NodeData[],
  levels: string[][],
  levelMap: Map<string, number>,
  metrics: TreeMetrics,
  gap: number,
  padding: number,
  direction: LayoutDirection
): PositionedNode[] {
  return nodes.map((node) => {
    if (node.position) return node as PositionedNode;

    const level = levelMap.get(node.id) ?? 0;
    const levelNodes = levels[level] ?? [];
    const idx = levelNodes.indexOf(node.id);
    const nodeWidth = node.size?.width ?? DEFAULT_NODE_SIZE.width;

    const x = calculateXPosition(level, metrics.maxLevel, nodeWidth, gap, padding, direction);
    const y = calculateYPosition(
      idx,
      levelNodes,
      metrics.maxNodeHeight,
      gap,
      metrics.totalHeight,
      metrics.baseY
    );

    return { ...node, position: { x, y } } as PositionedNode;
  });
}

/**
 * Get parent nodes for a given node
 */
function getParentNodes(nodeId: string, edges: EdgeData[]): string[] {
  return edges.filter((e) => e.target === nodeId).map((e) => e.source);
}

/**
 * Calculate average Y center of parent nodes
 */
function calculateParentCentersAverage(
  parentIds: string[],
  posMap: Map<string, PositionedNode>
): number | null {
  const centers = parentIds
    .map((src) => posMap.get(src))
    .filter((n): n is PositionedNode => !!n)
    .map((n) => n.position.y + (n.size?.height ?? DEFAULT_NODE_SIZE.height) / 2);

  if (!centers.length) return null;
  return centers.reduce((a, b) => a + b, 0) / centers.length;
}

/**
 * Align nodes with multiple parents to their parent's average position
 */
export function alignNodesToParents(
  positioned: PositionedNode[],
  edges: EdgeData[],
  levels: string[][],
  maxLevel: number
): PositionedNode[] {
  const posMap = new Map<string, PositionedNode>();
  positioned.forEach((n) => posMap.set(n.id, n));

  for (let level = 1; level <= maxLevel; level += 1) {
    const ids = levels[level] ?? [];
    ids.forEach((id) => {
      const node = posMap.get(id);
      if (!node) return;

      const parentIds = getParentNodes(id, edges);
      if (parentIds.length < 2) return;

      const avgCenterY = calculateParentCentersAverage(parentIds, posMap);
      if (avgCenterY === null) return;

      const h = node.size?.height ?? DEFAULT_NODE_SIZE.height;
      const newY = avgCenterY - h / 2;
      const updated = {
        ...node,
        position: { ...node.position, y: newY },
      } as PositionedNode;
      posMap.set(id, updated);
    });
  }

  return Array.from(posMap.values());
}
