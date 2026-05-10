import type {
  GraphConfig,
  GraphViewport,
  VertexComponent,
  NxGraphInput,
} from '@graph-render/types';

export type SquashNodeRenderMode = 'svg' | 'html' | 'export' | 'server';

export interface TournamentBracketProps {
  graph: NxGraphInput;
  config?: Partial<GraphConfig>;
  defaultViewport?: Partial<GraphViewport>;
  vertexComponent?: VertexComponent;
  nodeRenderMode?: SquashNodeRenderMode;
  title?: string;
  badgeText?: string;
  showToolbar?: boolean;
  showViewportControls?: boolean;
  defaultNavigationMode?: boolean;
  panEnabled?: boolean;
  zoomEnabled?: boolean;
  pinchZoomEnabled?: boolean;
  onInvalidNode?: (nodeId: string, error: Error) => void;
}
