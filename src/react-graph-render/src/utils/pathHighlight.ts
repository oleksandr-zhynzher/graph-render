import type { EdgeId, PathTraversalResult, PositionedEdge } from '@graph-render/types';

import { normalizePathKey } from './pathKeys';

export { type FocusedPath } from '../models/utils';

export function traverseHighlightedPath(options: {
  readonly startNodeId: string;
  readonly sourceIndex?: number | null;
  readonly pathKey?: string | undefined;
  readonly incomingEdgesByTarget: ReadonlyMap<string, readonly PositionedEdge[]>;
  readonly pathKeysByNode?: ReadonlyMap<string, readonly string[]> | undefined;
  /**
   * Hard upper bound on the number of nodes visited. Prevents the traversal
   * from freezing the UI on dense graphs when neither a pathKey nor a valid
   * sourceIndex is supplied and the algorithm falls back to following all
   * incoming edges.
   *
   * Defaults to 500.
   */
  readonly maxNodes?: number;
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
  const stack: Array<{ nodeId: string; sourceIndex: number | null; pathKey?: string | undefined }> =
    [{ nodeId: startNodeId, sourceIndex: sourceIndex ?? null, pathKey }];

  while (stack.length > 0) {
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

    if (chosen.length === 0) {
      if (current.sourceIndex == null) {
        chosen = [...incoming];
      } else if (incoming[current.sourceIndex]) {
        const edge = incoming[current.sourceIndex];
        if (edge) {
          chosen = [edge];
        }
      }
    }

    for (const edge of chosen) {
      if (edges.has(edge.id)) {
        continue;
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
    }
  }

  return { nodes, edges };
}

export { extractPathKeysFromNodes, normalizePathKey } from './pathKeys';
