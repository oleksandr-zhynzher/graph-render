import { useEffect, useMemo, useRef } from 'react';
import { EdgeData, GraphSearchResults, NodeData } from '@graph-render/types';

interface UseGraphSearchStateOptions<
  TNode extends NodeData<any, any, any> = NodeData,
  TEdge extends EdgeData<any, any> = EdgeData,
> {
  nodes: TNode[];
  edges: TEdge[];
  collapsedIds: string[];
  hiddenNodeIds?: string[];
  searchQuery?: string;
  hideUnmatchedSearch?: boolean;
  searchPredicate?: (node: TNode, query: string) => boolean;
  highlightedNodeIds?: string[];
  highlightedEdgeIds?: string[];
  highlightStrategy?: (context: {
    nodes: TNode[];
    edges: TEdge[];
    query: string;
    matchedNodeIds: string[];
    matchedEdgeIds: string[];
  }) => Partial<GraphSearchResults>;
  onSearchResultsChange?: (results: GraphSearchResults) => void;
}

export const useGraphSearchState = <
  TNode extends NodeData<any, any, any> = NodeData,
  TEdge extends EdgeData<any, any> = EdgeData,
>({
  nodes,
  edges,
  collapsedIds,
  hiddenNodeIds,
  searchQuery,
  hideUnmatchedSearch = false,
  searchPredicate,
  highlightedNodeIds,
  highlightedEdgeIds,
  highlightStrategy,
  onSearchResultsChange,
}: UseGraphSearchStateOptions<TNode, TEdge>) => {
  // Store the callback in a ref so that inline closures (whose reference
  // changes on every parent render) do not destabilise the effect below and
  // create an infinite render → effect → setState → render loop.
  const onSearchResultsChangeRef = useRef(onSearchResultsChange);
  onSearchResultsChangeRef.current = onSearchResultsChange;

  const searchMatchedNodeIds = useMemo(() => {
    const query = searchQuery?.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return nodes
      .filter((node) => {
        if (searchPredicate) {
          try {
            return searchPredicate(node, query);
          } catch {
            return false;
          }
        }

        const label =
          typeof node.label === 'string' || typeof node.label === 'number'
            ? String(node.label)
            : node.id;

        return node.id.toLowerCase().includes(query) || label.toLowerCase().includes(query);
      })
      .map((node) => node.id);
  }, [nodes, searchPredicate, searchQuery]);

  const searchMatchedNodeIdSet = useMemo(
    () => new Set(searchMatchedNodeIds),
    [searchMatchedNodeIds]
  );

  const searchMatchedEdgeIds = useMemo(() => {
    const query = searchQuery?.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return edges
      .filter((edge) => {
        const label = edge.label != null ? String(edge.label).toLowerCase() : '';
        return (
          searchMatchedNodeIdSet.has(edge.source) ||
          searchMatchedNodeIdSet.has(edge.target) ||
          label.includes(query)
        );
      })
      .map((edge) => edge.id);
  }, [edges, searchMatchedNodeIdSet, searchQuery]);

  const derivedHighlightResults = useMemo(() => {
    if (!searchQuery?.trim()) {
      return { nodeIds: [], edgeIds: [] };
    }

    return (() => {
      try {
        return (
          highlightStrategy?.({
            nodes,
            edges,
            query: searchQuery,
            matchedNodeIds: searchMatchedNodeIds,
            matchedEdgeIds: searchMatchedEdgeIds,
          }) ?? { nodeIds: [], edgeIds: [] }
        );
      } catch {
        return { nodeIds: [], edgeIds: [] };
      }
    })();
  }, [edges, highlightStrategy, nodes, searchMatchedEdgeIds, searchMatchedNodeIds, searchQuery]);

  const effectiveHighlightedNodeSet = useMemo(
    () =>
      new Set([
        ...searchMatchedNodeIds,
        ...(derivedHighlightResults.nodeIds ?? []),
        ...(highlightedNodeIds ?? []),
      ]),
    [derivedHighlightResults.nodeIds, highlightedNodeIds, searchMatchedNodeIds]
  );

  const effectiveHighlightedEdgeSet = useMemo(
    () =>
      new Set([
        ...searchMatchedEdgeIds,
        ...(derivedHighlightResults.edgeIds ?? []),
        ...(highlightedEdgeIds ?? []),
      ]),
    [derivedHighlightResults.edgeIds, highlightedEdgeIds, searchMatchedEdgeIds]
  );

  useEffect(() => {
    onSearchResultsChangeRef.current?.({
      nodeIds: searchMatchedNodeIds,
      edgeIds: searchMatchedEdgeIds,
    });
    // onSearchResultsChange is intentionally read via ref — omitting it from
    // the dep array prevents inline callbacks from creating an infinite loop.
  }, [searchMatchedEdgeIds, searchMatchedNodeIds]);

  const hiddenNodeSet = useMemo(() => {
    const hidden = new Set(hiddenNodeIds ?? []);
    if (hideUnmatchedSearch && searchQuery?.trim()) {
      nodes.forEach((node) => {
        if (!effectiveHighlightedNodeSet.has(node.id)) {
          hidden.add(node.id);
        }
      });
    }
    return hidden;
  }, [effectiveHighlightedNodeSet, hiddenNodeIds, hideUnmatchedSearch, nodes, searchQuery]);

  // Build the outgoing adjacency map once, keyed only on `edges`.
  // Both `descendantHiddenNodeSet` (collapse traversal) and
  // `childNodeIdsByParent` (returned to callers) previously built this map
  // independently, causing duplicate O(n) work on every collapse toggle.
  const outgoingBySource = useMemo(() => {
    const map = new Map<string, string[]>();
    edges.forEach((edge) => {
      map.set(edge.source, [...(map.get(edge.source) ?? []), edge.target]);
    });
    return map;
  }, [edges]);

  const descendantHiddenNodeSet = useMemo(() => {
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
  }, [collapsedIds, hiddenNodeSet, outgoingBySource]);

  const visibleNodes = useMemo(
    () => nodes.filter((node) => !descendantHiddenNodeSet.has(node.id)),
    [descendantHiddenNodeSet, nodes]
  );

  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (edge) =>
          !descendantHiddenNodeSet.has(edge.source) && !descendantHiddenNodeSet.has(edge.target)
      ),
    [descendantHiddenNodeSet, edges]
  );

  const childNodeIdsByParent = outgoingBySource;

  return {
    effectiveHighlightedNodeSet,
    effectiveHighlightedEdgeSet,
    visibleNodes,
    visibleEdges,
    childNodeIdsByParent,
  };
};
