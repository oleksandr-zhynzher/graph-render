import { PositionedEdge, EdgeId } from './edge';

/**
 * Options for traversing a highlighted path from a starting node.
 */
export interface PathTraversalOptions {
  startNodeId: string;
  sourceIndex?: number | null;
  pathKey?: string;
  incomingEdgesByTarget: Map<string, PositionedEdge[]>;
  pathKeysByNode?: Map<string, string[]>;
}

/**
 * Result of graph path traversal
 */
export interface PathTraversalResult {
  nodes: Set<string>;
  edges: Set<EdgeId>;
}
