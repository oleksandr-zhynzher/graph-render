import { NodeId, NodeData } from './node';
import { EdgeData } from './edge';

export type NxNodeAttrs = Partial<Omit<NodeData, 'id'>>;
export type NxEdgeAttrs = Partial<Omit<EdgeData, 'id' | 'source' | 'target'>> & { id?: string };

export interface NxGraphInput {
  nodes?: Record<NodeId, NxNodeAttrs>;
  adj: Record<NodeId, Record<NodeId, NxEdgeAttrs | NxEdgeAttrs[]>>;
}
