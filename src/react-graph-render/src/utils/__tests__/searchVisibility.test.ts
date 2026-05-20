import { describe, expect, it } from 'vitest';

import {
  buildDescendantHiddenNodeSet,
  buildOutgoingBySource,
  buildSearchHiddenNodeSet,
  filterVisibleEdges,
  filterVisibleNodes,
} from '../searchVisibility';

const makeNode = (id: string) => ({ id }) as any;
const makeEdge = (id: string, source: string, target: string) => ({ id, source, target }) as any;

describe('buildOutgoingBySource', () => {
  it('returns empty map for empty edges', () => {
    expect(buildOutgoingBySource([])).toEqual(new Map());
  });

  it('maps source to list of targets', () => {
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'a', 'c')];
    const map = buildOutgoingBySource(edges);
    expect(map.get('a')).toEqual(['b', 'c']);
  });

  it('handles multiple sources', () => {
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'c')];
    const map = buildOutgoingBySource(edges);
    expect(map.get('a')).toEqual(['b']);
    expect(map.get('b')).toEqual(['c']);
  });
});

describe('buildSearchHiddenNodeSet', () => {
  const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];

  it('returns empty set when hideUnmatchedSearch is false', () => {
    const result = buildSearchHiddenNodeSet({
      effectiveHighlightedNodeSet: new Set(['a']),
      hideUnmatchedSearch: false,
      nodes,
      searchQuery: 'x',
    });
    expect(result.size).toBe(0);
  });

  it('returns empty set when searchQuery is blank', () => {
    const result = buildSearchHiddenNodeSet({
      effectiveHighlightedNodeSet: new Set(),
      hideUnmatchedSearch: true,
      nodes,
      searchQuery: '  ',
    });
    expect(result.size).toBe(0);
  });

  it('hides unmatched nodes when hideUnmatchedSearch and query provided', () => {
    const result = buildSearchHiddenNodeSet({
      effectiveHighlightedNodeSet: new Set(['a']),
      hideUnmatchedSearch: true,
      nodes,
      searchQuery: 'x',
    });
    expect(result.has('b')).toBe(true);
    expect(result.has('c')).toBe(true);
    expect(result.has('a')).toBe(false);
  });

  it('includes pre-existing hiddenNodeIds', () => {
    const result = buildSearchHiddenNodeSet({
      effectiveHighlightedNodeSet: new Set(['a', 'b', 'c']),
      hiddenNodeIds: ['b'],
      hideUnmatchedSearch: true,
      nodes,
      searchQuery: 'x',
    });
    expect(result.has('b')).toBe(true);
  });
});

describe('buildDescendantHiddenNodeSet', () => {
  it('returns the same hidden set when no collapsed ids', () => {
    const hidden = new Set(['a']);
    const result = buildDescendantHiddenNodeSet([], hidden, new Map());
    expect(result.has('a')).toBe(true);
  });

  it('hides descendants of collapsed nodes', () => {
    const outgoing = new Map([
      ['root', ['child']],
      ['child', ['grandchild']],
    ]);
    const result = buildDescendantHiddenNodeSet(['root'], new Set(), outgoing);
    expect(result.has('child')).toBe(true);
    expect(result.has('grandchild')).toBe(true);
  });

  it('does not re-process already-hidden nodes', () => {
    // If 'child' is already hidden, it should not cause infinite loop
    const outgoing = new Map([
      ['root', ['child']],
      ['child', ['child']],
    ]);
    expect(() => buildDescendantHiddenNodeSet(['root'], new Set(), outgoing)).not.toThrow();
  });
});

describe('filterVisibleNodes', () => {
  const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];

  it('returns all nodes when hidden set is empty', () => {
    expect(filterVisibleNodes(nodes, new Set())).toHaveLength(3);
  });

  it('filters out hidden nodes', () => {
    const result = filterVisibleNodes(nodes, new Set(['b']));
    expect(result.map((n: any) => n.id)).toEqual(['a', 'c']);
  });
});

describe('filterVisibleEdges', () => {
  const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'c'), makeEdge('e3', 'a', 'c')];

  it('returns all edges when nothing is hidden', () => {
    expect(filterVisibleEdges(edges, new Set())).toHaveLength(3);
  });

  it('filters edges whose source is hidden', () => {
    const result = filterVisibleEdges(edges, new Set(['a']));
    expect(result.map((e: any) => e.id)).toEqual(['e2']);
  });

  it('filters edges whose target is hidden', () => {
    const result = filterVisibleEdges(edges, new Set(['c']));
    expect(result.map((e: any) => e.id)).toEqual(['e1']);
  });
});
