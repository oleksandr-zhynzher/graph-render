import type { EdgeData, NodeData } from '@graph-render/types';

export const buildOutgoingBySource = <TEdge extends EdgeData>(
  edges: readonly TEdge[]
): ReadonlyMap<string, readonly string[]> => {
  const map = new Map<string, string[]>();
  for (const edge of edges) {
    map.set(edge.source, [...(map.get(edge.source) ?? []), edge.target]);
  }
  return map;
};

export const buildSearchHiddenNodeSet = <TNode extends NodeData>({
  effectiveHighlightedNodeSet,
  hiddenNodeIds,
  hideUnmatchedSearch,
  nodes,
  searchQuery,
}: {
  readonly effectiveHighlightedNodeSet: ReadonlySet<string>;
  readonly hiddenNodeIds?: readonly string[] | undefined;
  readonly hideUnmatchedSearch: boolean;
  readonly nodes: readonly TNode[];
  readonly searchQuery?: string | undefined;
}): ReadonlySet<string> => {
  const hidden = new Set(hiddenNodeIds ?? []);
  if (hideUnmatchedSearch && searchQuery?.trim()) {
    for (const node of nodes) {
      if (!effectiveHighlightedNodeSet.has(node.id)) {
        hidden.add(node.id);
      }
    }
  }
  return hidden;
};

export const buildDescendantHiddenNodeSet = (
  collapsedIds: readonly string[],
  hiddenNodeSet: ReadonlySet<string>,
  outgoingBySource: ReadonlyMap<string, readonly string[]>
): ReadonlySet<string> => {
  const hidden = new Set(hiddenNodeSet);
  for (const nodeId of collapsedIds) {
    const stack = [...(outgoingBySource.get(nodeId) ?? [])];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || hidden.has(current)) {
        continue;
      }
      hidden.add(current);
      stack.push(...(outgoingBySource.get(current) ?? []));
    }
  }
  return hidden;
};

export const filterVisibleNodes = <TNode extends NodeData>(
  nodes: readonly TNode[],
  hiddenNodeSet: ReadonlySet<string>
): readonly TNode[] => nodes.filter((node) => !hiddenNodeSet.has(node.id));

export const filterVisibleEdges = <TEdge extends EdgeData>(
  edges: readonly TEdge[],
  hiddenNodeSet: ReadonlySet<string>
): readonly TEdge[] =>
  edges.filter((edge) => !hiddenNodeSet.has(edge.source) && !hiddenNodeSet.has(edge.target));
