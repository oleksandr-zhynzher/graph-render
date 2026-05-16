import type { EdgeData, NodeData } from '@graph-render/types';

export const buildOutgoingBySource = <TEdge extends EdgeData>(
  edges: TEdge[]
): Map<string, string[]> => {
  const map = new Map<string, string[]>();
  edges.forEach((edge) => {
    map.set(edge.source, [...(map.get(edge.source) ?? []), edge.target]);
  });
  return map;
};

export const buildSearchHiddenNodeSet = <TNode extends NodeData>({
  effectiveHighlightedNodeSet,
  hiddenNodeIds,
  hideUnmatchedSearch,
  nodes,
  searchQuery,
}: {
  effectiveHighlightedNodeSet: Set<string>;
  hiddenNodeIds?: string[];
  hideUnmatchedSearch: boolean;
  nodes: TNode[];
  searchQuery?: string;
}): Set<string> => {
  const hidden = new Set(hiddenNodeIds ?? []);
  if (hideUnmatchedSearch && searchQuery?.trim()) {
    nodes.forEach((node) => {
      if (!effectiveHighlightedNodeSet.has(node.id)) {
        hidden.add(node.id);
      }
    });
  }
  return hidden;
};

export const buildDescendantHiddenNodeSet = (
  collapsedIds: string[],
  hiddenNodeSet: Set<string>,
  outgoingBySource: Map<string, string[]>
): Set<string> => {
  const hidden = new Set(hiddenNodeSet);
  collapsedIds.forEach((nodeId) => {
    const stack = [...(outgoingBySource.get(nodeId) ?? [])];
    while (stack.length) {
      const current = stack.pop();
      if (!current || hidden.has(current)) {
        continue;
      }
      hidden.add(current);
      stack.push(...(outgoingBySource.get(current) ?? []));
    }
  });
  return hidden;
};

export const filterVisibleNodes = <TNode extends NodeData>(
  nodes: TNode[],
  hiddenNodeSet: Set<string>
): TNode[] => nodes.filter((node) => !hiddenNodeSet.has(node.id));

export const filterVisibleEdges = <TEdge extends EdgeData>(
  edges: TEdge[],
  hiddenNodeSet: Set<string>
): TEdge[] =>
  edges.filter((edge) => !hiddenNodeSet.has(edge.source) && !hiddenNodeSet.has(edge.target));
