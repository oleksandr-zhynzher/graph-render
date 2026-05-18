import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useGraphSearchState } from '../useGraphSearchState';

const makeNode = (id: string, label = id) => ({ id, label }) as any;
const makeEdge = (id: string, source: string, target: string) => ({ id, source, target }) as any;

describe('useGraphSearchState', () => {
  it('returns all nodes as visible when no search, no collapsed', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const { result } = renderHook(() =>
      useGraphSearchState({ nodes, edges: [], collapsedIds: [] })
    );
    expect(result.current.visibleNodes).toHaveLength(2);
  });

  it('filters visible edges based on visible nodes', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('e1', 'a', 'b')];
    const { result } = renderHook(() => useGraphSearchState({ nodes, edges, collapsedIds: [] }));
    expect(result.current.visibleEdges).toHaveLength(1);
  });

  it('hides descendants of collapsed nodes', () => {
    const nodes = [makeNode('root'), makeNode('child'), makeNode('other')];
    const edges = [makeEdge('e1', 'root', 'child')];
    const { result } = renderHook(() =>
      useGraphSearchState({ nodes, edges, collapsedIds: ['root'] })
    );
    const visibleIds = result.current.visibleNodes.map((n: any) => n.id);
    expect(visibleIds).not.toContain('child');
    expect(visibleIds).toContain('root');
    expect(visibleIds).toContain('other');
  });

  it('highlights matching nodes when searchQuery is set', () => {
    const nodes = [makeNode('foo', 'foo-label'), makeNode('bar', 'bar-label')];
    const { result } = renderHook(() =>
      useGraphSearchState({ nodes, edges: [], collapsedIds: [], searchQuery: 'foo' })
    );
    expect(result.current.effectiveHighlightedNodeSet.has('foo')).toBe(true);
    expect(result.current.effectiveHighlightedNodeSet.has('bar')).toBe(false);
  });

  it('hides unmatched nodes when hideUnmatchedSearch is true', () => {
    const nodes = [makeNode('foo', 'foo-label'), makeNode('bar', 'bar-label')];
    const { result } = renderHook(() =>
      useGraphSearchState({
        nodes,
        edges: [],
        collapsedIds: [],
        searchQuery: 'foo',
        hideUnmatchedSearch: true,
      })
    );
    const visibleIds = result.current.visibleNodes.map((n: any) => n.id);
    expect(visibleIds).toContain('foo');
    expect(visibleIds).not.toContain('bar');
  });

  it('calls onSearchResultsChange when search results change', async () => {
    const onSearchResultsChange = vi.fn();
    const nodes = [makeNode('foo', 'foo-label')];
    renderHook(() =>
      useGraphSearchState({
        nodes,
        edges: [],
        collapsedIds: [],
        searchQuery: 'foo',
        onSearchResultsChange,
      })
    );
    // onSearchResultsChange is called in useEffect, which runs after render
    await Promise.resolve();
    expect(onSearchResultsChange).toHaveBeenCalled();
  });

  it('includes explicitly highlighted nodes in effectiveHighlightedNodeSet', () => {
    const nodes = [makeNode('n1'), makeNode('n2')];
    const { result } = renderHook(() =>
      useGraphSearchState({
        nodes,
        edges: [],
        collapsedIds: [],
        highlightedNodeIds: ['n2'],
      })
    );
    expect(result.current.effectiveHighlightedNodeSet.has('n2')).toBe(true);
  });

  it('includes explicitly highlighted edges in effectiveHighlightedEdgeSet', () => {
    const nodes = [makeNode('n1'), makeNode('n2')];
    const edges = [makeEdge('e1', 'n1', 'n2')];
    const { result } = renderHook(() =>
      useGraphSearchState({
        nodes,
        edges,
        collapsedIds: [],
        highlightedEdgeIds: ['e1'],
      })
    );
    expect(result.current.effectiveHighlightedEdgeSet.has('e1')).toBe(true);
  });

  it('respects hiddenNodeIds to hide nodes', () => {
    const nodes = [makeNode('n1'), makeNode('n2')];
    const { result } = renderHook(() =>
      useGraphSearchState({ nodes, edges: [], collapsedIds: [], hiddenNodeIds: ['n1'] })
    );
    const visibleIds = result.current.visibleNodes.map((n: any) => n.id);
    expect(visibleIds).not.toContain('n1');
  });
});
