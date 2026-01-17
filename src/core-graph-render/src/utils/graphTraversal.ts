import {
  PositionedEdge,
  EdgeId,
  PathTraversalOptions,
  PathTraversalResult,
} from '@graph-render/types';

/**
 * Group edges by their target node
 */
export function groupEdgesByTarget(edges: PositionedEdge[]): Map<string, PositionedEdge[]> {
  const map = new Map<string, PositionedEdge[]>();
  edges.forEach((edge) => {
    const arr = map.get(edge.target) ?? [];
    arr.push(edge);
    map.set(edge.target, arr);
  });
  return map;
}

/**
 * Sort edges by their source node position (y first, then x)
 */
export function sortEdgesBySourcePosition(
  edges: PositionedEdge[],
  nodePositions: Map<string, { x: number; y: number }>
): PositionedEdge[] {
  return [...edges].sort((a, b) => {
    const pa = nodePositions.get(a.source);
    const pb = nodePositions.get(b.source);
    if (pa && pb) {
      if (pa.y !== pb.y) return pa.y - pb.y;
      return pa.x - pb.x;
    }
    return 0;
  });
}

/**
 * Traverse graph backwards from a starting node to find connected path
 */
export function traverseGraphPath(options: PathTraversalOptions): PathTraversalResult {
  const { startNodeId, sourceIndex, playerKey, incomingEdgesByTarget, playerNamesByNode } = options;

  const nodes = new Set<string>();
  const edges = new Set<EdgeId>();
  const normalizeName = (name: string) => name.trim().toLowerCase();

  const stack: Array<{ nodeId: string; sourceIndex: number | null; playerKey?: string }> = [
    { nodeId: startNodeId, sourceIndex: sourceIndex ?? null, playerKey },
  ];

  nodes.add(startNodeId);

  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;

    const incoming = incomingEdgesByTarget.get(current.nodeId) ?? [];
    const key = current.playerKey ? normalizeName(current.playerKey) : null;
    let chosen: PositionedEdge[] = [];

    // Try to find edge by player key
    if (key && playerNamesByNode) {
      for (let i = 0; i < incoming.length; i += 1) {
        const edge = incoming[i];
        const names = playerNamesByNode.get(edge.source);
        if (names?.some((name) => normalizeName(name) === key)) {
          chosen = [edge];
          break;
        }
      }
    }

    // Fallback to index-based or all edges
    if (!chosen.length) {
      if (current.sourceIndex == null) {
        chosen = incoming;
      } else if (incoming[current.sourceIndex]) {
        chosen = [incoming[current.sourceIndex]];
      }
    }

    chosen.forEach((edge) => {
      if (edges.has(edge.id)) return;
      edges.add(edge.id);

      if (!nodes.has(edge.source)) {
        nodes.add(edge.source);
        const sourceNames = playerNamesByNode?.get(edge.source) ?? [];
        const nextIndex = key
          ? sourceNames.findIndex((name) => normalizeName(name) === key)
          : (current.sourceIndex ?? -1);
        stack.push({
          nodeId: edge.source,
          sourceIndex: nextIndex >= 0 ? nextIndex : current.sourceIndex,
          playerKey: current.playerKey,
        });
      }
    });
  }

  return { nodes, edges };
}

/**
 * Extract player names from node metadata
 */
export function extractPlayerNamesFromNodes(
  nodes: Array<{ id: string; meta?: any }>
): Map<string, string[]> {
  const map = new Map<string, string[]>();

  nodes.forEach((node) => {
    const players = node.meta?.players as Array<{ name?: string } | string> | undefined;
    if (!Array.isArray(players)) return;

    const names = players
      .map((p) => (typeof p === 'string' ? p : p?.name))
      .filter((v): v is string => !!v)
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    if (names.length) {
      map.set(node.id, names);
    }
  });

  return map;
}
