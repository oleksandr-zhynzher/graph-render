import type { EdgeData, NodeData, PositionedNode } from '@graph-render/types';

import { DEFAULT_NODE_GAP, DEFAULT_NODE_SIZE, DEFAULT_PADDING } from '../utils';
import { centeredLayout } from './centered';
import {
  assertHierarchicalGraph,
  assignNodesToLevels,
  buildGraphTopology,
  findRootNodes,
  groupNodesByLevel,
} from './treeTopology';

export const radialTreeLayout = (
  nodes: readonly NodeData[],
  edges: readonly EdgeData[],
  pad: number = DEFAULT_PADDING,
  width = 960,
  height = 720,
  gap: number = DEFAULT_NODE_GAP
): readonly PositionedNode[] => {
  if (nodes.length === 0) {
    return [];
  }

  if (edges.length === 0) {
    return centeredLayout(nodes, pad, width, height);
  }

  assertHierarchicalGraph(nodes, edges);

  const { incoming, outgoing } = buildGraphTopology(edges);
  const rootIds = findRootNodes(nodes, incoming);
  const levelsMap = assignNodesToLevels(nodes, rootIds, outgoing);
  const levels = groupNodesByLevel(nodes, levelsMap);
  const centerX = width / 2;
  const centerY = height / 2;
  // FIX: use reduce instead of spread+Math.max to avoid a RangeError when the
  // node array exceeds the JS engine's argument-count limit (~125 k in V8).
  const maxNodeSize = nodes.reduce(
    (max, node) =>
      Math.max(
        max,
        node.size?.width ?? DEFAULT_NODE_SIZE.width,
        node.size?.height ?? DEFAULT_NODE_SIZE.height
      ),
    0
  );
  const maxRadius = Math.max(0, Math.min(width, height) / 2 - pad - maxNodeSize / 2);
  const radiusStep = levels.length > 1 ? maxRadius / (levels.length - 1) : 0;

  // FIX: pre-build an id→node map to avoid an O(n) Array.find inside the
  // levels.flatMap loop, which was O(n²) overall.
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  return levels.flatMap((level, levelIndex) => {
    const radius =
      levelIndex === 0 ? 0 : Math.max(radiusStep * levelIndex, maxNodeSize + gap * 0.4);

    return level.map((nodeId, nodeIndex) => {
      const node = nodeById.get(nodeId)!;
      const size = node.size ?? DEFAULT_NODE_SIZE;
      const angle =
        level.length === 1 ? -Math.PI / 2 : (2 * Math.PI * nodeIndex) / level.length - Math.PI / 2;
      const position =
        levelIndex === 0
          ? { x: centerX - size.width / 2, y: centerY - size.height / 2 }
          : {
              x: centerX + radius * Math.cos(angle) - size.width / 2,
              y: centerY + radius * Math.sin(angle) - size.height / 2,
            };

      return {
        ...node,
        position,
      };
    });
  });
};
