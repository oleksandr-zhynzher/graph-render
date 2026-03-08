import type { NxGraphInput } from '@graph-render/types';

function buildOutgoingMap(graph: NxGraphInput): Map<string, string[]> {
  const outgoing = new Map<string, string[]>();

  Object.entries(graph.adj).forEach(([source, neighbors]) => {
    outgoing.set(source, Object.keys(neighbors));
    Object.keys(neighbors).forEach((target) => {
      if (!outgoing.has(target)) {
        outgoing.set(target, []);
      }
    });
  });

  Object.keys(graph.nodes ?? {}).forEach((nodeId) => {
    if (!outgoing.has(nodeId)) {
      outgoing.set(nodeId, []);
    }
  });

  return outgoing;
}

function inferRoundCount(graph: NxGraphInput): number {
  const outgoing = buildOutgoingMap(graph);
  if (!outgoing.size) {
    return 0;
  }

  const inDegree = new Map(Array.from(outgoing.keys(), (nodeId) => [nodeId, 0]));
  outgoing.forEach((targets) => {
    targets.forEach((target) => {
      inDegree.set(target, (inDegree.get(target) ?? 0) + 1);
    });
  });

  const roots = Array.from(inDegree.entries())
    .filter(([, degree]) => degree === 0)
    .map(([nodeId]) => nodeId);

  if (!roots.length) {
    return 0;
  }

  const queue = [...roots];
  const levels = new Map<string, number>(roots.map((nodeId) => [nodeId, 0]));

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const level = levels.get(current) ?? 0;

    (outgoing.get(current) ?? []).forEach((target) => {
      const nextLevel = level + 1;
      const existing = levels.get(target);
      if (existing == null || nextLevel > existing) {
        levels.set(target, nextLevel);
      }

      inDegree.set(target, (inDegree.get(target) ?? 0) - 1);
      if ((inDegree.get(target) ?? 0) === 0) {
        queue.push(target);
      }
    });
  }

  const maxLevel = Math.max(...levels.values());
  return Number.isFinite(maxLevel) ? maxLevel + 1 : 0;
}

/**
 * Derive round labels from the number of matches (nodes).
 * Example: 15 matches -> 4 rounds => ["1/8", "1/4", "1/2", "Final"].
 */
export function roundLabelsForMatchCount(matchCount: number): string[] {
  if (!Number.isFinite(matchCount) || matchCount <= 0) return [];
  const rounds = Math.max(1, Math.ceil(Math.log2(matchCount + 1)));
  return Array.from({ length: rounds }, (_, idx) => {
    const remaining = rounds - idx;
    return remaining === 1 ? 'Final' : `1/${2 ** (remaining - 1)}`;
  });
}

/**
 * Convenience helper to derive labels directly from a graph definition.
 */
export function roundLabelsForGraph(graph: NxGraphInput): string[] {
  return roundLabelsForMatchCount(inferRoundCount(graph));
}
