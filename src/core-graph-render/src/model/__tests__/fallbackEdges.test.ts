import { EdgeType, type PositionedNode } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { buildFallbackEdges } from '../fallbackEdges';

const makeNode = (id: string, x = 0, y = 0, w = 100, h = 50): PositionedNode => ({
  id,
  position: { x, y },
  size: { width: w, height: h },
});

const makeEdge = (id: string, source: string, target: string) => ({
  id,
  source,
  target,
});

describe('buildFallbackEdges', () => {
  it('returns empty array for empty edges', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    expect(buildFallbackEdges(nodes, [])).toHaveLength(0);
  });

  it('builds a 2-point edge between node centers', () => {
    const nodes = [makeNode('a', 0, 0), makeNode('b', 200, 100)];
    const edges = [makeEdge('e1', 'a', 'b')];
    const result = buildFallbackEdges(nodes, edges);
    expect(result).toHaveLength(1);
    const edge = result[0]!;
    expect(edge.points).toHaveLength(2);
    // Source center: x=0+50=50, y=0+25=25
    expect(edge.points[0]).toEqual({ x: 50, y: 25 });
    // Target center: x=200+50=250, y=100+25=125
    expect(edge.points[1]).toEqual({ x: 250, y: 125 });
  });

  it('builds a 4-point self-loop edge', () => {
    const nodes = [makeNode('a', 0, 0)];
    const edges = [makeEdge('loop', 'a', 'a')];
    const result = buildFallbackEdges(nodes, edges);
    expect(result).toHaveLength(1);
    expect(result[0]!.points).toHaveLength(4);
  });

  it('skips edges with a missing source node', () => {
    const nodes = [makeNode('b', 0, 0)];
    const edges = [makeEdge('e1', 'missing', 'b')];
    expect(buildFallbackEdges(nodes, edges)).toHaveLength(0);
  });

  it('skips edges with a missing target node', () => {
    const nodes = [makeNode('a', 0, 0)];
    const edges = [makeEdge('e1', 'a', 'missing')];
    expect(buildFallbackEdges(nodes, edges)).toHaveLength(0);
  });

  it('defaults edge type to Directed when not provided', () => {
    const nodes = [makeNode('a', 0, 0), makeNode('b', 200, 0)];
    const edges = [makeEdge('e1', 'a', 'b')];
    const result = buildFallbackEdges(nodes, edges);
    expect(result[0]!.type).toBe(EdgeType.Directed);
  });

  it('preserves explicit edge type', () => {
    const nodes = [makeNode('a', 0, 0), makeNode('b', 200, 0)];
    const edges = [{ id: 'e1', source: 'a', target: 'b', type: EdgeType.Undirected }];
    const result = buildFallbackEdges(nodes, edges);
    expect(result[0]!.type).toBe(EdgeType.Undirected);
  });
});
