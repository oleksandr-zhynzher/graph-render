import { EdgeData, EdgeType } from '@graph-render/types';
import { ParallelEdgeMeta } from './types';

export type { ParallelEdgeMeta };

export const DEFAULT_PARALLEL_EDGE_META: ParallelEdgeMeta = {
  index: 0,
  total: 1,
  centeredOffset: 0,
};

const getParallelGroupKey = (edge: EdgeData): string => {
  const pair = [edge.source, edge.target].sort().join('|');
  return `${pair}|${edge.type ?? EdgeType.Directed}`;
};

export const buildParallelEdgeIndex = (edges: EdgeData[]): Map<string, ParallelEdgeMeta> => {
  const groups = new Map<string, EdgeData[]>();

  edges.forEach((edge) => {
    const key = getParallelGroupKey(edge);
    groups.set(key, [...(groups.get(key) ?? []), edge]);
  });

  const meta = new Map<string, ParallelEdgeMeta>();
  groups.forEach((group) => {
    const total = group.length;
    group.forEach((edge, index) => {
      meta.set(edge.id, {
        index,
        total,
        centeredOffset: index - (total - 1) / 2,
      });
    });
  });

  return meta;
};
