import { EdgeType, type EdgeData } from '@graph-render/types';

export const normalizeEdges = (edges: EdgeData[], defaultType: EdgeType): EdgeData[] => {
  return edges.map((edge) => ({ ...edge, type: edge.type ?? defaultType }));
};
