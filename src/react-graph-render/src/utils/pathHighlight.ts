import { EdgeId, PositionedEdge } from '@graph-render/types';

export interface PathTraversalResult {
  nodes: Set<string>;
  edges: Set<EdgeId>;
}

export interface FocusedPath {
  nodeId: string;
  sourceIndex: number | null;
  pathKey?: string;
}

type NodeWithPathMeta = {
  id: string;
  meta?: Record<string, unknown>;
};

function normalizePathKey(value: string): string {
  return value.trim().toLowerCase();
}

export function extractPathKeysFromNodes(nodes: NodeWithPathMeta[]): Map<string, string[]> {
  const map = new Map<string, string[]>();

  nodes.forEach((node) => {
    const meta = node.meta;
    if (!meta) {
      return;
    }

    const rawPathKeys = meta.pathKeys;
    const rawPlayers = meta.players;

    const pathKeys = Array.isArray(rawPathKeys)
      ? rawPathKeys
      : Array.isArray(rawPlayers)
        ? rawPlayers
        : [];

    const normalized = pathKeys
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry;
        }

        if (
          typeof entry === 'object' &&
          entry !== null &&
          'name' in entry &&
          typeof entry.name === 'string'
        ) {
          return entry.name;
        }

        return null;
      })
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (normalized.length) {
      map.set(node.id, normalized);
    }
  });

  return map;
}

export function traverseHighlightedPath(options: {
  startNodeId: string;
  sourceIndex?: number | null;
  pathKey?: string;
  incomingEdgesByTarget: Map<string, PositionedEdge[]>;
  pathKeysByNode?: Map<string, string[]>;
}): PathTraversalResult {
  const { startNodeId, sourceIndex, pathKey, incomingEdgesByTarget, pathKeysByNode } = options;

  const nodes = new Set<string>([startNodeId]);
  const edges = new Set<EdgeId>();
  const stack: Array<{ nodeId: string; sourceIndex: number | null; pathKey?: string }> = [
    { nodeId: startNodeId, sourceIndex: sourceIndex ?? null, pathKey },
  ];

  while (stack.length) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    const incoming = incomingEdgesByTarget.get(current.nodeId) ?? [];
    const normalizedKey = current.pathKey ? normalizePathKey(current.pathKey) : null;
    let chosen: PositionedEdge[] = [];

    if (normalizedKey && pathKeysByNode) {
      chosen = incoming.filter((edge) => {
        const keys = pathKeysByNode.get(edge.source) ?? [];
        return keys.some((candidate) => normalizePathKey(candidate) === normalizedKey);
      });
    }

    if (!chosen.length) {
      if (current.sourceIndex == null) {
        chosen = incoming;
      } else if (incoming[current.sourceIndex]) {
        chosen = [incoming[current.sourceIndex]];
      }
    }

    chosen.forEach((edge) => {
      if (edges.has(edge.id)) {
        return;
      }

      edges.add(edge.id);
      nodes.add(edge.source);

      const sourceKeys = pathKeysByNode?.get(edge.source) ?? [];
      const nextSourceIndex = normalizedKey
        ? sourceKeys.findIndex((candidate) => normalizePathKey(candidate) === normalizedKey)
        : current.sourceIndex;
      const resolvedSourceIndex =
        typeof nextSourceIndex === 'number' && nextSourceIndex >= 0
          ? nextSourceIndex
          : current.sourceIndex;

      stack.push({
        nodeId: edge.source,
        sourceIndex: resolvedSourceIndex,
        pathKey: current.pathKey,
      });
    });
  }

  return { nodes, edges };
}
