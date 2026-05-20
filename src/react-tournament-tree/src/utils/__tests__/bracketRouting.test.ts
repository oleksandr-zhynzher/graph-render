import type { EdgeData, PositionedNode } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { routeBracketEdges } from '../bracketRouting';

// ── helpers ───────────────────────────────────────────────────────────────────

function node(id: string, x: number, y: number, w = 280, h = 100): PositionedNode {
  return { id, position: { x, y }, size: { width: w, height: h } };
}

function edge(source: string, target: string): EdgeData {
  return { id: `${source}->${target}`, source, target };
}

// ── routeBracketEdges ─────────────────────────────────────────────────────────

describe('routeBracketEdges', () => {
  it('returns an empty array for no edges', () => {
    expect(routeBracketEdges([node('a', 0, 0)], [])).toEqual([]);
  });

  it('returns points: [] when source node is missing', () => {
    const result = routeBracketEdges([node('b', 200, 0)], [edge('missing', 'b')]);
    expect(result[0]?.points).toEqual([]);
  });

  it('returns points: [] when target node is missing', () => {
    const result = routeBracketEdges([node('a', 0, 0)], [edge('a', 'missing')]);
    expect(result[0]?.points).toEqual([]);
  });

  it('computes 4 waypoints for a valid edge', () => {
    const nodes = [node('a', 0, 0, 280, 100), node('b', 400, 50, 280, 100)];
    const result = routeBracketEdges(nodes, [edge('a', 'b')]);
    expect(result[0]?.points).toHaveLength(4);
  });

  it('routes from the right edge of source to the left edge of target', () => {
    const nodes = [node('a', 0, 0, 280, 100), node('b', 400, 50, 280, 100)];
    const result = routeBracketEdges(nodes, [edge('a', 'b')]);
    const pts = result[0]?.points ?? [];
    // First point: source right edge
    expect(pts[0]).toEqual({ x: 280, y: 50 }); // x=0+280, y=0+100/2
    // Last point: target left edge
    expect(pts[3]).toEqual({ x: 400, y: 100 }); // x=400, y=50+100/2
  });

  it('calculates the midX as midpoint between sourceRight and targetLeft', () => {
    const nodes = [node('a', 0, 0, 280, 100), node('b', 400, 50, 280, 100)];
    const result = routeBracketEdges(nodes, [edge('a', 'b')]);
    const pts = result[0]?.points ?? [];
    const midX = (280 + 400) / 2; // 340
    expect(pts[1]?.x).toBe(midX);
    expect(pts[2]?.x).toBe(midX);
  });

  it('preserves the y coordinates correctly', () => {
    // source mid-y = 20 + 60/2 = 50; target mid-y = 100 + 80/2 = 140
    const nodes = [node('a', 0, 20, 100, 60), node('b', 200, 100, 100, 80)];
    const result = routeBracketEdges(nodes, [edge('a', 'b')]);
    const pts = result[0]?.points ?? [];
    expect(pts[0]?.y).toBe(50); // sourceMidY
    expect(pts[1]?.y).toBe(50); // midX at sourceMidY
    expect(pts[2]?.y).toBe(140); // midX at targetMidY
    expect(pts[3]?.y).toBe(140); // targetMidY
  });

  it('handles nodes without size (defaults to 0)', () => {
    const noSizeNodes: PositionedNode[] = [
      { id: 'a', position: { x: 0, y: 0 } },
      { id: 'b', position: { x: 100, y: 0 } },
    ];
    const result = routeBracketEdges(noSizeNodes, [edge('a', 'b')]);
    const pts = result[0]?.points ?? [];
    expect(pts).toHaveLength(4);
    // sourceRight = 0+0=0, targetLeft=100, midX=50
    expect(pts[0]).toEqual({ x: 0, y: 0 });
    expect(pts[3]).toEqual({ x: 100, y: 0 });
  });

  it('preserves non-routing edge properties', () => {
    const nodes = [node('a', 0, 0, 280, 100), node('b', 400, 50, 280, 100)];
    const e: EdgeData = { id: 'e1', source: 'a', target: 'b', label: 'test' };
    const result = routeBracketEdges(nodes, [e]);
    expect((result[0] as typeof e & { points: unknown[] }).label).toBe('test');
  });

  it('handles multiple edges independently', () => {
    const nodes = [
      node('a', 0, 0, 100, 50),
      node('b', 200, 0, 100, 50),
      node('c', 400, 0, 100, 50),
    ];
    const result = routeBracketEdges(nodes, [edge('a', 'b'), edge('b', 'c')]);
    expect(result).toHaveLength(2);
    for (const e of result) {
      expect(e.points).toHaveLength(4);
    }
  });
});
