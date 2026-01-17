import type { GraphConfig, VertexComponent, NxGraphInput } from '@graph-render/types';

export interface TournamentBracketProps {
  graph: NxGraphInput;
  config?: Partial<GraphConfig>;
  vertexComponent?: VertexComponent;
}
