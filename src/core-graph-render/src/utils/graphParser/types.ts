import type { EdgeData, NodeData } from '@graph-render/types';

export type GraphNodeTuple<
  TNodeData,
  TNodeMeta extends Record<string, unknown>,
  TNodeLabel,
> = NodeData<TNodeData, TNodeMeta, TNodeLabel>;

export type GraphEdgeTuple<TEdgeMeta extends Record<string, unknown>, TEdgeLabel> = EdgeData<
  TEdgeMeta,
  TEdgeLabel
>;
