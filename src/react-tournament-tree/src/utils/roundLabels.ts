import type { NxGraphInput } from '@graph-render/types';

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
  const nodes = graph?.nodes ? Object.keys(graph.nodes).length : 0;
  return roundLabelsForMatchCount(nodes);
}
