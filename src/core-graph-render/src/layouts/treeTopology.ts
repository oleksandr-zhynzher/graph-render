import type { EdgeData, GraphTopology, NodeData } from '@graph-render/types';

export const assertHierarchicalGraph = (
  nodes: readonly NodeData[],
  edges: readonly EdgeData[]
): void => {
  if (nodes.length === 0) {
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

  const queue = [...inDegree.entries()]
    .filter(([, degree]) => degree === 0)
    .map(([nodeId]) => nodeId);

  if (queue.length === 0) {
    throw new Error(
      'Tree layout requires at least one root node and does not support cyclic graphs.'
    );
  }

  let processed = 0;
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (!current) {
      continue;
    }
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
export const buildGraphTopology = (edges: readonly EdgeData[]): GraphTopology => {
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, string[]>();

  for (const e of edges) {
    incoming.set(e.target, (incoming.get(e.target) ?? 0) + 1);
    outgoing.set(e.source, [...(outgoing.get(e.source) ?? []), e.target]);
  }

  return { incoming, outgoing };
};

/**
 * Find root nodes (nodes with no incoming edges)
 */
export const findRootNodes = (
  nodes: readonly NodeData[],
  incoming: ReadonlyMap<string, number>
): readonly string[] => {
  const roots = nodes.filter((n) => (incoming.get(n.id) ?? 0) === 0);
  return roots.map((r) => r.id);
};

/**
 * Assign nodes to levels using BFS
 */
export const assignNodesToLevels = (
  nodes: readonly NodeData[],
  rootIds: readonly string[],
  outgoing: ReadonlyMap<string, readonly string[]>
): ReadonlyMap<string, number> => {
  if (nodes.length === 0) {
    return new Map();
  }

  const levelMap = new Map<string, number>();
  const queue = [...rootIds];
  for (const id of rootIds) levelMap.set(id, 0);

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (!current) {
      continue;
    }
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
 * Assign DAG-style max-depth levels using a single Kahn's BFS pass.
 * Validates edge references and detects cycles in the same traversal,
 * replacing the three-pass pattern of assertHierarchicalGraph +
 * buildGraphTopology + an inline BFS.
 */
export const assignDagLevels = (
  nodes: readonly NodeData[],
  edges: readonly EdgeData[]
): {
  readonly levels: ReadonlyMap<string, number>;
  readonly outgoing: ReadonlyMap<string, readonly string[]>;
} => {
  if (nodes.length === 0) {
    return { levels: new Map(), outgoing: new Map() };
  }

  const nodeSet = new Set(nodes.map((n) => n.id));
  const inDegree = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  const outgoing = new Map<string, string[]>();

  for (const edge of edges) {
    if (!nodeSet.has(edge.source) || !nodeSet.has(edge.target)) {
      throw new Error(
        `DAG layout requires every edge to reference existing nodes. Invalid edge: ${edge.source} -> ${edge.target}.`
      );
    }
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
    const children = outgoing.get(edge.source) ?? [];
    children.push(edge.target);
    outgoing.set(edge.source, children);
  }

  const levels = new Map<string, number>();
  const queue = nodes.filter((n) => inDegree.get(n.id) === 0).map((n) => n.id);

  if (queue.length === 0) {
    throw new Error(
      'DAG layout requires at least one root node and does not support cyclic graphs.'
    );
  }

  for (const id of queue) levels.set(id, 0);
  let processed = 0;

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (!current) {
      continue;
    }
    processed += 1;
    const currentLevel = levels.get(current) ?? 0;

    for (const child of outgoing.get(current) ?? []) {
      levels.set(child, Math.max(levels.get(child) ?? 0, currentLevel + 1));
      const nextInDegree = (inDegree.get(child) ?? 0) - 1;
      inDegree.set(child, nextInDegree);
      if (nextInDegree === 0) {
        queue.push(child);
      }
    }
  }

  if (processed !== nodes.length) {
    throw new Error(
      'DAG layout requires an acyclic graph. Cycles were detected in the input graph.'
    );
  }

  return { levels, outgoing };
};

/**
 * Group nodes by their level
 */
export const groupNodesByLevel = (
  nodes: readonly NodeData[],
  levelMap: ReadonlyMap<string, number>
): ReadonlyArray<readonly string[]> => {
  const levels: string[][] = [];
  for (const n of nodes) {
    const l = levelMap.get(n.id);
    if (l == null) {
      throw new Error(
        `Tree layout could not assign a level to node "${n.id}". Ensure the graph is connected from at least one root and acyclic.`
      );
    }
    if (!levels[l]) levels[l] = [];
    levels[l].push(n.id);
  }
  return levels;
};
