import type { EdgeId, PathTraversalResult, PositionedEdge } from '@graph-render/types';
import { normalizePathKey } from './pathKeys';
import type { FocusedPath } from '../models/utils';

export { extractPathKeysFromNodes, normalizePathKey } from './pathKeys';

export type { FocusedPath };

export function traverseHighlightedPath(options: {
  startNodeId: string;
  sourceIndex?: number | null;
  pathKey?: string;
  incomingEdgesByTarget: Map<string, PositionedEdge[]>;
  pathKeysByNode?: Map<string, string[]>;
  /**
   * Hard upper bound on the number of nodes visited. Prevents the traversal
   * from freezing the UI on dense graphs when neither a pathKey nor a valid
   * sourceIndex is supplied and the algorithm falls back to following all
   * incoming edges.
   *
   * Defaults to 500.
   */
  maxNodes?: number;
}): PathTraversalResult {
  const {
    startNodeId,
    sourceIndex,
    pathKey,
    incomingEdgesByTarget,
    pathKeysByNode,
    maxNodes = 500,
  } = options;

  const nodes = new Set<string>([startNodeId]);
  const edges = new Set<EdgeId>();
  // Track which (nodeId, sourceIndex, pathKey) combinations have been pushed
  // onto the stack so that a node reached via multiple paths is not processed
  // more than once — preventing exponential fan-out on dense DAGs.
  const visitedKeys = new Set<string>([`${startNodeId}|${sourceIndex ?? ''}|${pathKey ?? ''}`]);
  const stack: Array<{ nodeId: string; sourceIndex: number | null; pathKey?: string }> = [
    { nodeId: startNodeId, sourceIndex: sourceIndex ?? null, pathKey },
  ];

  while (stack.length) {
    // Hard cap to prevent blocking the main thread on dense graphs where the
    // fallback "follow all incoming edges" path would visit the entire graph.
    if (nodes.size >= maxNodes) {
      break;
    }

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

      const visitKey = `${edge.source}|${resolvedSourceIndex ?? ''}|${current.pathKey ?? ''}`;
      if (!visitedKeys.has(visitKey)) {
        visitedKeys.add(visitKey);
        stack.push({
          nodeId: edge.source,
          sourceIndex: resolvedSourceIndex,
          pathKey: current.pathKey,
        });
      }
    });
  }

  return { nodes, edges };
}
