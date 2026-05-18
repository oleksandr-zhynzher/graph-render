import { describe, expect, it } from 'vitest';

import { buildEdgeById, buildEdgesByNodeId, buildNodePositionMap } from '../graphHoverMaps';

const makeEdge = (id: string, source: string, target: string) =>
  ({ id, source, target, points: [] }) as any;

describe('buildEdgeById', () => {
  it('returns an empty map for no edges', () => {
    expect(buildEdgeById([])).toEqual(new Map());
  });

  it('maps each edge by its id', () => {
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'c')];
    const map = buildEdgeById(edges);
    expect(map.get('e1')).toBe(edges[0]);
    expect(map.get('e2')).toBe(edges[1]);
    expect(map.size).toBe(2);
  });
});

describe('buildEdgesByNodeId', () => {
  it('returns empty map for no edges', () => {
    expect(buildEdgesByNodeId([])).toEqual(new Map());
  });

  it('lists edges by their source node', () => {
    const e1 = makeEdge('e1', 'a', 'b');
    const map = buildEdgesByNodeId([e1]);
    expect(map.get('a')).toContain(e1);
  });

  it('lists edges by their target node', () => {
    const e1 = makeEdge('e1', 'a', 'b');
    const map = buildEdgesByNodeId([e1]);
    expect(map.get('b')).toContain(e1);
  });

  it('does not duplicate a self-loop edge', () => {
    const selfLoop = makeEdge('e1', 'a', 'a');
    const map = buildEdgesByNodeId([selfLoop]);
    const entries = map.get('a') ?? [];
    expect(entries).toHaveLength(1);
  });

  it('accumulates multiple edges for the same node', () => {
    const e1 = makeEdge('e1', 'a', 'b');
    const e2 = makeEdge('e2', 'a', 'c');
    const map = buildEdgesByNodeId([e1, e2]);
    expect(map.get('a')).toHaveLength(2);
  });
});

describe('buildNodePositionMap', () => {
  it('returns empty map for no nodes', () => {
    expect(buildNodePositionMap([])).toEqual(new Map());
  });

  it('maps each node id to its position', () => {
    const nodes = [
      { id: 'n1', position: { x: 10, y: 20 } },
      { id: 'n2', position: { x: 30, y: 40 } },
    ] as any[];
    const map = buildNodePositionMap(nodes);
    expect(map.get('n1')).toEqual({ x: 10, y: 20 });
    expect(map.get('n2')).toEqual({ x: 30, y: 40 });
  });
});
