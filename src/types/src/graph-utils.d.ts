import { PositionedEdge, EdgeId } from './edge';
/**
 * Options for traversing graph backwards from a starting node
 */
export interface PathTraversalOptions {
    startNodeId: string;
    sourceIndex?: number | null;
    playerKey?: string;
    incomingEdgesByTarget: Map<string, PositionedEdge[]>;
    playerNamesByNode?: Map<string, string[]>;
}
/**
 * Result of graph path traversal
 */
export interface PathTraversalResult {
    nodes: Set<string>;
    edges: Set<EdgeId>;
}
//# sourceMappingURL=graph-utils.d.ts.map