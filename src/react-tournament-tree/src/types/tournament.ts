import type { GraphConfig, VertexComponent, NxGraphInput } from '@graph-render/types';

export type SquashNodeRenderMode = 'svg' | 'html' | 'export' | 'server';

export interface TournamentBracketProps {
  graph: NxGraphInput;
  config?: Partial<GraphConfig>;
  vertexComponent?: VertexComponent;
  nodeRenderMode?: SquashNodeRenderMode;
  title?: string;
  badgeText?: string;
  showToolbar?: boolean;
}
