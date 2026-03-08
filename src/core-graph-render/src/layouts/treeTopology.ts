import { NodeData, EdgeData, GraphTopology } from '@graph-render/types';

export const assertHierarchicalGraph = (nodes: NodeData[], edges: EdgeData[]): void => {
  if (!nodes.length) {
    return;
  }

  const inDegree = new Map(nodes.map((node) => [node.id, 0]));
  const outgoing = new Map<string, string[]>();

  for (const edge of edges) {
    if (!inDegree.has(edge.source) || !inDegree.has(edge.target)) {
      throw new Error(
        `Tree layout requires every edge to reference existing nodes. Invalid edge: ${edge.source} -> ${edge.target}.`
      );
    }

    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
    outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge.target]);
  }

  const queue = Array.from(inDegree.entries())
    .filter(([, degree]) => degree === 0)
    .map(([nodeId]) => nodeId);

  if (!queue.length) {
    throw new Error(
      'Tree layout requires at least one root node and does not support cyclic graphs.'
    );
  }

  let processed = 0;
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    processed += 1;

    for (const child of outgoing.get(current) ?? []) {
      const nextDegree = (inDegree.get(child) ?? 0) - 1;
      inDegree.set(child, nextDegree);
      if (nextDegree === 0) {
        queue.push(child);
      }
    }
  }

  if (processed !== nodes.length) {
    throw new Error(
      'Tree layout requires an acyclic graph. Cycles were detected in the input graph.'
    );
  }
};

/**
 * Build graph topology from edges
 */
export const buildGraphTopology = (edges: EdgeData[]): GraphTopology => {
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, string[]>();

  edges.forEach((e) => {
    incoming.set(e.target, (incoming.get(e.target) ?? 0) + 1);
    outgoing.set(e.source, [...(outgoing.get(e.source) ?? []), e.target]);
  });

  return { incoming, outgoing };
};

/**
 * Find root nodes (nodes with no incoming edges)
 */
export const findRootNodes = (nodes: NodeData[], incoming: Map<string, number>): string[] => {
  const roots = nodes.filter((n) => (incoming.get(n.id) ?? 0) === 0);
  return roots.map((r) => r.id);
};

/**
 * Assign nodes to levels using BFS
 */
export const assignNodesToLevels = (
  nodes: NodeData[],
  rootIds: string[],
  outgoing: Map<string, string[]>
): Map<string, number> => {
  const levelMap = new Map<string, number>();
  const queue = [...rootIds];
  rootIds.forEach((id) => levelMap.set(id, 0));

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const level = levelMap.get(current) ?? 0;
    for (const child of outgoing.get(current) ?? []) {
      if (!levelMap.has(child)) {
        levelMap.set(child, level + 1);
        queue.push(child);
      }
    }
  }

  return levelMap;
};

/**
 * Group nodes by their level
 */
export const groupNodesByLevel = (nodes: NodeData[], levelMap: Map<string, number>): string[][] => {
  const levels: string[][] = [];
  nodes.forEach((n) => {
    const l = levelMap.get(n.id);
    if (l == null) {
      throw new Error(
        `Tree layout could not assign a level to node "${n.id}". Ensure the graph is connected from at least one root and acyclic.`
      );
    }
    if (!levels[l]) levels[l] = [];
    levels[l].push(n.id);
  });
  return levels;
};
