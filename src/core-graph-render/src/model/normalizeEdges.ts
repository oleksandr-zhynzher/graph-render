import type { EdgeData, EdgeType } from '@graph-render/types';

export const normalizeEdges = (
  edges: readonly EdgeData[],
  defaultType: EdgeType
): readonly EdgeData[] => {
  return edges.map((edge) => ({ ...edge, type: edge.type ?? defaultType }));
};
