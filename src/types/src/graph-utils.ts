import type { EdgeId, PositionedEdge } from './edge';

/**
 * Options for traversing a highlighted path from a starting node.
 */
export interface PathTraversalOptions {
  readonly startNodeId: string;
  readonly sourceIndex?: number | null;
  readonly pathKey?: string;
  readonly incomingEdgesByTarget: ReadonlyMap<string, readonly PositionedEdge[]>;
  readonly pathKeysByNode?: ReadonlyMap<string, readonly string[]>;
}

/**
 * Result of graph path traversal
 */
export interface PathTraversalResult {
  readonly nodes: ReadonlySet<string>;
  readonly edges: ReadonlySet<EdgeId>;
}
