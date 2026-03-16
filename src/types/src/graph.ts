import { NodeId, NodeData } from './node';
import { EdgeData } from './edge';

export type NxNodeAttrs<
  TData = unknown,
  TMeta extends object = Record<string, unknown>,
  TLabel = unknown,
> = Partial<Omit<NodeData<TData, TMeta, TLabel>, 'id'>>;
export type NxEdgeAttrs<TMeta extends object = Record<string, unknown>, TLabel = unknown> = Partial<
  Omit<EdgeData<TMeta, TLabel>, 'id' | 'source' | 'target'>
> & { id?: string };

export interface NxGraphInput<
  TNodeData = unknown,
  TNodeMeta extends object = Record<string, unknown>,
  TNodeLabel = unknown,
  TEdgeMeta extends object = Record<string, unknown>,
  TEdgeLabel = unknown,
> {
  nodes?: Record<NodeId, NxNodeAttrs<TNodeData, TNodeMeta, TNodeLabel>>;
  adj: Record<
    NodeId,
    Record<NodeId, NxEdgeAttrs<TEdgeMeta, TEdgeLabel> | NxEdgeAttrs<TEdgeMeta, TEdgeLabel>[]>
  >;
}
