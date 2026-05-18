import { describe, expect, it } from 'vitest';

import { traverseHighlightedPath } from '../pathHighlight';

const makeEdge = (id: string, source: string, target: string) =>
  ({ id, source, target, points: [] }) as any;

const makeIncomingMap = (edges: Array<{ id: string; source: string; target: string }>) => {
  const map = new Map<string, any[]>();
  for (const edge of edges) {
    map.set(edge.target, [
      ...(map.get(edge.target) ?? []),
      makeEdge(edge.id, edge.source, edge.target),
    ]);
  }
  return map;
};

describe('traverseHighlightedPath', () => {
  it('returns at least the start node when no incoming edges', () => {
    const result = traverseHighlightedPath({
      startNodeId: 'leaf',
      incomingEdgesByTarget: new Map(),
    });
    expect(result.nodes.has('leaf')).toBe(true);
    expect(result.edges.size).toBe(0);
  });

  it('traverses all incoming edges from the start node', () => {
    const edges = [
      { id: 'e1', source: 'a', target: 'leaf' },
      { id: 'e2', source: 'b', target: 'leaf' },
    ];
    const result = traverseHighlightedPath({
      startNodeId: 'leaf',
      incomingEdgesByTarget: makeIncomingMap(edges),
    });
    expect(result.nodes.has('a')).toBe(true);
    expect(result.nodes.has('b')).toBe(true);
    expect(result.edges.has('e1')).toBe(true);
    expect(result.edges.has('e2')).toBe(true);
  });

  it('traverses a chain of nodes', () => {
    // a → b → c → leaf
    const edges = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'c' },
      { id: 'e3', source: 'c', target: 'leaf' },
    ];
    const result = traverseHighlightedPath({
      startNodeId: 'leaf',
      incomingEdgesByTarget: makeIncomingMap(edges),
    });
    expect(result.nodes.has('a')).toBe(true);
    expect(result.nodes.has('b')).toBe(true);
    expect(result.nodes.has('c')).toBe(true);
  });

  it('selects edge by sourceIndex when provided', () => {
    const incoming = [makeEdge('e1', 'src0', 'leaf'), makeEdge('e2', 'src1', 'leaf')];
    const map = new Map([['leaf', incoming]]);
    const result = traverseHighlightedPath({
      startNodeId: 'leaf',
      sourceIndex: 1,
      incomingEdgesByTarget: map,
    });
    expect(result.edges.has('e2')).toBe(true);
    expect(result.edges.has('e1')).toBe(false);
  });

  it('respects maxNodes limit', () => {
    // Create a chain longer than the limit
    const edgeList: Array<{ id: string; source: string; target: string }> = [];
    for (let i = 0; i < 10; i++) {
      edgeList.push({ id: `e${i}`, source: `n${i}`, target: i === 0 ? 'leaf' : `n${i - 1}` });
    }
    const result = traverseHighlightedPath({
      startNodeId: 'leaf',
      incomingEdgesByTarget: makeIncomingMap(edgeList),
      maxNodes: 3,
    });
    expect(result.nodes.size).toBeLessThanOrEqual(3);
  });

  it('does not revisit already-visited nodes', () => {
    // Diamond: a→b, a→c, b→leaf, c→leaf
    const edges = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'a', target: 'c' },
      { id: 'e3', source: 'b', target: 'leaf' },
      { id: 'e4', source: 'c', target: 'leaf' },
    ];
    const result = traverseHighlightedPath({
      startNodeId: 'leaf',
      incomingEdgesByTarget: makeIncomingMap(edges),
    });
    // 'a' should be visited once; we just verify no infinite loop and a is included
    expect(result.nodes.has('a')).toBe(true);
  });
});
