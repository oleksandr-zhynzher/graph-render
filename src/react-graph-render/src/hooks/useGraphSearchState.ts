import { useEffect, useMemo, useRef } from 'react';
import type { EdgeData, NodeData } from '@graph-render/types';
import {
  findSearchMatchedEdgeIds,
  findSearchMatchedNodeIds,
  getDerivedHighlightResults,
} from '../utils/searchMatching';
import {
  buildDescendantHiddenNodeSet,
  buildOutgoingBySource,
  buildSearchHiddenNodeSet,
  filterVisibleEdges,
  filterVisibleNodes,
} from '../utils/searchVisibility';
import type { UseGraphSearchStateOptions } from '../models/hooks';

export const useGraphSearchState = <
  TNode extends NodeData = NodeData,
  TEdge extends EdgeData = EdgeData,
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
  const onSearchResultsChangeRef = useRef(onSearchResultsChange);
  onSearchResultsChangeRef.current = onSearchResultsChange;

  const searchMatchedNodeIds = useMemo(() => {
    return findSearchMatchedNodeIds(nodes, searchQuery, searchPredicate);
  }, [nodes, searchPredicate, searchQuery]);

  const searchMatchedNodeIdSet = useMemo(
    () => new Set(searchMatchedNodeIds),
    [searchMatchedNodeIds]
  );

  const searchMatchedEdgeIds = useMemo(() => {
    return findSearchMatchedEdgeIds(edges, searchQuery, searchMatchedNodeIdSet);
  }, [edges, searchMatchedNodeIdSet, searchQuery]);

  const derivedHighlightResults = useMemo(() => {
    return getDerivedHighlightResults(
      {
        nodes,
        edges,
        query: searchQuery ?? '',
        matchedNodeIds: searchMatchedNodeIds,
        matchedEdgeIds: searchMatchedEdgeIds,
      },
      highlightStrategy
    );
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
  }, [searchMatchedEdgeIds, searchMatchedNodeIds]);

  const hiddenNodeSet = useMemo(() => {
    return buildSearchHiddenNodeSet({
      effectiveHighlightedNodeSet,
      hiddenNodeIds,
      hideUnmatchedSearch,
      nodes,
      searchQuery,
    });
  }, [effectiveHighlightedNodeSet, hiddenNodeIds, hideUnmatchedSearch, nodes, searchQuery]);

  const outgoingBySource = useMemo(() => {
    return buildOutgoingBySource(edges);
  }, [edges]);

  const descendantHiddenNodeSet = useMemo(() => {
    return buildDescendantHiddenNodeSet(collapsedIds, hiddenNodeSet, outgoingBySource);
  }, [collapsedIds, hiddenNodeSet, outgoingBySource]);

  const visibleNodes = useMemo(
    () => filterVisibleNodes(nodes, descendantHiddenNodeSet),
    [descendantHiddenNodeSet, nodes]
  );

  const visibleEdges = useMemo(
    () => filterVisibleEdges(edges, descendantHiddenNodeSet),
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
