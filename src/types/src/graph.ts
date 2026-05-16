import type { EdgeData } from './edge';
import type { NodeData, NodeId } from './node';

export enum GraphInputValidationMode {
  Auto = 'auto',
  Strict = 'strict',
  Implicit = 'implicit',
}

export interface GraphParserOptions {
  readonly inputValidationMode?: GraphInputValidationMode;
}

export type NxNodeAttrs<
  TData = unknown,
  TMeta extends object = Record<string, unknown>,
  TLabel = unknown,
> = Partial<Omit<NodeData<TData, TMeta, TLabel>, 'id'>>;
export type NxEdgeAttrs<TMeta extends object = Record<string, unknown>, TLabel = unknown> = Partial<
  Omit<EdgeData<TMeta, TLabel>, 'id' | 'source' | 'target'>
> & { readonly id?: string };

export interface NxGraphInput<
  TNodeData = unknown,
  TNodeMeta extends object = Record<string, unknown>,
  TNodeLabel = unknown,
  TEdgeMeta extends object = Record<string, unknown>,
  TEdgeLabel = unknown,
> {
  readonly nodes?: Record<NodeId, NxNodeAttrs<TNodeData, TNodeMeta, TNodeLabel>>;
  readonly adj: Record<
    NodeId,
    Record<
      NodeId,
      NxEdgeAttrs<TEdgeMeta, TEdgeLabel> | ReadonlyArray<NxEdgeAttrs<TEdgeMeta, TEdgeLabel>>
    >
  >;
}
