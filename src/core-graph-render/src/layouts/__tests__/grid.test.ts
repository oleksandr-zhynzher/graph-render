import { describe, expect, it } from 'vitest';

import { gridLayout } from '../grid';

const makeNode = (id: string, extra: Record<string, unknown> = {}) => ({ id, ...extra });

describe('gridLayout', () => {
  it('returns an empty array for empty input', () => {
    expect(gridLayout([])).toHaveLength(0);
  });

  it('positions a single node', () => {
    const nodes = [makeNode('a')];
    const result = gridLayout(nodes);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('position');
  });

  it('places 4 nodes in a 2×2 grid', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c'), makeNode('d')];
    const result = gridLayout(nodes, 0, 0);
    // ceil(sqrt(4)) = 2 columns
    const xs = result.map((n) => n.position.x);
    const uniqueX = new Set(xs);
    expect(uniqueX.size).toBe(2);
  });

  it('preserves existing positions', () => {
    const nodes = [{ id: 'a', position: { x: 999, y: 999 } }];
    const result = gridLayout(nodes);
    expect(result[0]!.position).toEqual({ x: 999, y: 999 });
  });

  it('uses node size when provided', () => {
    const nodes = [{ id: 'a', size: { width: 200, height: 100 } }, makeNode('b')];
    const result = gridLayout(nodes, 0, 0);
    // Second node (no explicit size) uses DEFAULT_NODE_SIZE.width=180 for its column offset
    expect(result[1]!.position.x).toBe(180);
  });

  it('applies padding', () => {
    const nodes = [makeNode('a')];
    const result = gridLayout(nodes, 50, 0);
    expect(result[0]!.position.x).toBe(50);
    expect(result[0]!.position.y).toBe(50);
  });

  it('applies gap between nodes', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const result = gridLayout(nodes, 0, 10);
    // With default node size (180×72) and gap=10: second node at x=190
    const xs = result.map((n) => n.position.x).sort((a, b) => a - b);
    expect(xs[1]! - xs[0]!).toBeGreaterThan(0);
  });
});
