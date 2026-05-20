import { EdgeType } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { buildHoveredNodeStates, getHighlightedEdgeIds } from '../graphHoverState';

const makeEdge = (id: string, source: string, target: string, type = EdgeType.Directed) =>
  ({ id, source, target, type, points: [] }) as any;

const baseParams = (overrides = {}) => ({
  hoverHighlight: true,
  focusedPath: null,
  hoveredEdgeId: null,
  hoveredNodeId: null,
  edgeById: new Map(),
  edgesByNodeId: new Map(),
  pathHighlight: null,
  ...overrides,
});

describe('buildHoveredNodeStates', () => {
  it('returns null when hoverHighlight is false and no pathHighlight', () => {
    const result = buildHoveredNodeStates(
      baseParams({ hoverHighlight: false, pathHighlight: null })
    );
    expect(result).toBeNull();
  });

  it('returns null when nothing is hovered', () => {
    const result = buildHoveredNodeStates(baseParams());
    expect(result).toBeNull();
  });

  it('marks source as out and target as in for a directed hovered edge', () => {
    const edge = makeEdge('e1', 'n1', 'n2');
    const params = baseParams({
      hoveredEdgeId: 'e1',
      edgeById: new Map([['e1', edge]]),
    });
    const result = buildHoveredNodeStates(params)!;
    expect(result.get('n1')).toEqual({ in: false, out: true });
    expect(result.get('n2')).toEqual({ in: true, out: false });
  });

  it('marks both nodes in and out for an undirected hovered edge', () => {
    const edge = makeEdge('e1', 'n1', 'n2', EdgeType.Undirected);
    const params = baseParams({
      hoveredEdgeId: 'e1',
      edgeById: new Map([['e1', edge]]),
    });
    const result = buildHoveredNodeStates(params)!;
    expect(result.get('n1')).toEqual({ in: true, out: true });
    expect(result.get('n2')).toEqual({ in: true, out: true });
  });

  it('marks connected nodes when a node is hovered', () => {
    const edge = makeEdge('e1', 'n1', 'n2');
    const params = baseParams({
      hoveredNodeId: 'n1',
      edgesByNodeId: new Map([['n1', [edge]]]),
    });
    const result = buildHoveredNodeStates(params)!;
    expect(result.get('n1')).toMatchObject({ in: true, out: true });
    expect(result.get('n2')).toMatchObject({ in: true });
  });

  it('applies path highlight node states', () => {
    const params = baseParams({
      pathHighlight: { nodes: new Set(['n1', 'n2']), edges: new Set() },
    });
    const result = buildHoveredNodeStates(params)!;
    expect(result.get('n1')).toEqual({ in: true, out: true });
    expect(result.get('n2')).toEqual({ in: true, out: true });
  });

  it('uses only path nodes when focusedPath is set', () => {
    const params = baseParams({
      focusedPath: { nodeId: 'n1', sourceIndex: null },
      pathHighlight: { nodes: new Set(['n1']), edges: new Set() },
    });
    const result = buildHoveredNodeStates(params)!;
    expect(result.get('n1')).toEqual({ in: true, out: true });
  });
});

describe('getHighlightedEdgeIds', () => {
  const edge = makeEdge('e1', 'n1', 'n2');

  it('returns empty set when nothing is hovered', () => {
    const ids = getHighlightedEdgeIds(true, null, null, null, new Map(), null);
    expect(ids.size).toBe(0);
  });

  it('returns the hovered edge id when an edge is hovered', () => {
    const ids = getHighlightedEdgeIds(true, null, 'e1', null, new Map(), null);
    expect(ids.has('e1')).toBe(true);
  });

  it('returns connected edge ids when a node is hovered', () => {
    const map = new Map([['n1', [edge]]]);
    const ids = getHighlightedEdgeIds(true, null, null, 'n1', map, null);
    expect(ids.has('e1')).toBe(true);
  });

  it('includes path highlight edges', () => {
    const pathHighlight = { nodes: new Set(['n1']), edges: new Set(['pe1']) };
    const ids = getHighlightedEdgeIds(true, null, null, null, new Map(), pathHighlight);
    expect(ids.has('pe1')).toBe(true);
  });

  it('returns only focused path edges when focusedPath is set', () => {
    const pathHighlight = { nodes: new Set<string>(), edges: new Set(['pe1']) };
    const ids = getHighlightedEdgeIds(
      true,
      { nodeId: 'n1', sourceIndex: null },
      'e1',
      null,
      new Map(),
      pathHighlight
    );
    expect(ids.has('pe1')).toBe(true);
    expect(ids.has('e1')).toBe(false);
  });

  it('returns empty set when hoverHighlight is false and no path', () => {
    const map = new Map([['n1', [edge]]]);
    const ids = getHighlightedEdgeIds(false, null, 'e1', 'n1', map, null);
    expect(ids.size).toBe(0);
  });
});
