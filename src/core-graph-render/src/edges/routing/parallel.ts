import { type EdgeData, EdgeType } from '@graph-render/types';

import type { ParallelEdgeMeta } from './types';

export const DEFAULT_PARALLEL_EDGE_META: ParallelEdgeMeta = {
  index: 0,
  total: 1,
  centeredOffset: 0,
};

const getParallelGroupKey = (edge: EdgeData): string => {
  const pair = [edge.source, edge.target].sort().join('|');
  return `${pair}|${edge.type ?? EdgeType.Directed}`;
};

export const buildParallelEdgeIndex = (
  edges: readonly EdgeData[]
): ReadonlyMap<string, ParallelEdgeMeta> => {
  const groups = new Map<string, EdgeData[]>();

  for (const edge of edges) {
    const key = getParallelGroupKey(edge);
    groups.set(key, [...(groups.get(key) ?? []), edge]);
  }

  const meta = new Map<string, ParallelEdgeMeta>();
  for (const [, group] of groups) {
    const total = group.length;
    for (const [index, edge] of group.entries()) {
      meta.set(edge.id, {
        index,
        total,
        centeredOffset: index - (total - 1) / 2,
      });
    }
  }

  return meta;
};

export { type ParallelEdgeMeta } from './types';
