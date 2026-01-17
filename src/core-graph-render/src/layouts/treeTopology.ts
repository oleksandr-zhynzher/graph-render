import { NodeData, EdgeData, GraphTopology } from '@graph-render/types';

/**
 * Build graph topology from edges
 */
export function buildGraphTopology(edges: EdgeData[]): GraphTopology {
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, string[]>();

  edges.forEach((e) => {
    incoming.set(e.target, (incoming.get(e.target) ?? 0) + 1);
    outgoing.set(e.source, [...(outgoing.get(e.source) ?? []), e.target]);
  });

  return { incoming, outgoing };
}

/**
 * Find root nodes (nodes with no incoming edges)
 */
export function findRootNodes(nodes: NodeData[], incoming: Map<string, number>): string[] {
  const roots = nodes.filter((n) => (incoming.get(n.id) ?? 0) === 0);
  return roots.length ? roots.map((r) => r.id) : nodes.slice(0, 1).map((n) => n.id);
}

/**
 * Assign nodes to levels using BFS
 */
export function assignNodesToLevels(
  nodes: NodeData[],
  rootIds: string[],
  outgoing: Map<string, string[]>
): Map<string, number> {
  const levelMap = new Map<string, number>();
  const queue = [...rootIds];
  rootIds.forEach((id) => levelMap.set(id, 0));

  while (queue.length) {
    const current = queue.shift()!;
    const level = levelMap.get(current) ?? 0;
    for (const child of outgoing.get(current) ?? []) {
      if (!levelMap.has(child)) {
        levelMap.set(child, level + 1);
        queue.push(child);
      }
    }
  }

  return levelMap;
}

/**
 * Group nodes by their level
 */
export function groupNodesByLevel(
  nodes: NodeData[],
  levelMap: Map<string, number>,
  rootIds: string[]
): string[][] {
  const levels: string[][] = [];
  nodes.forEach((n) => {
    const l = levelMap.get(n.id) ?? (rootIds.includes(n.id) ? 0 : 1);
    if (!levels[l]) levels[l] = [];
    levels[l].push(n.id);
  });
  return levels;
}
