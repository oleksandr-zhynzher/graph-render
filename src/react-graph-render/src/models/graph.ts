import type {
  EdgeData,
  GraphConfig,
  GraphSearchResults,
  LayoutOptions,
  NodeData,
  NormalizedGraphConfig,
  NxGraphInput,
  PositionedEdge,
  PositionedNode,
  RouteEdgesOptions,
  Size,
} from '@graph-render/types';

export type GraphModelErrorPhase = 'layout' | 'layout-override' | 'routing' | 'routing-override';

export type GraphModelErrorHandler = (
  error: Error,
  context: {
    graph: NxGraphInput;
    phase: GraphModelErrorPhase;
  }
) => void;

export interface UseGraphModelOptions {
  graph: NxGraphInput;
  config: NormalizedGraphConfig;
  mergedTheme: NonNullable<GraphConfig['theme']>;
  collapsedIds: string[];
  hiddenNodeIds?: string[];
  searchQuery?: string;
  hideUnmatchedSearch?: boolean;
  searchPredicate?: (node: NodeData, query: string) => boolean;
  highlightedNodeIds?: string[];
  highlightedEdgeIds?: string[];
  highlightStrategy?: (context: {
    nodes: NodeData[];
    edges: EdgeData[];
    query: string;
    matchedNodeIds: string[];
    matchedEdgeIds: string[];
  }) => Partial<GraphSearchResults>;
  onSearchResultsChange?: (results: GraphSearchResults) => void;
  layoutNodesOverride?: (options: LayoutOptions) => PositionedNode[];
  routeEdgesOverride?: (
    nodes: PositionedNode[],
    edges: EdgeData[],
    options?: RouteEdgesOptions
  ) => PositionedEdge[];
  onError?: GraphModelErrorHandler;
}

export interface GraphModelResult {
  childNodeIdsByParent: Map<string, string[]>;
  effectiveHighlightedEdgeSet: Set<string>;
  effectiveHighlightedNodeSet: Set<string>;
  handleNodeMeasure: (nodeId: string, size: Size) => void;
  positionedEdges: PositionedEdge[];
  positionedNodes: PositionedNode[];
  visibleEdges: EdgeData[];
  visibleNodesWithMeasuredSize: NodeData[];
}
