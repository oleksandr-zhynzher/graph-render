import { describe, expect, it } from 'vitest';

import { expandBounds, getEdgeLabelBounds, mergeBounds } from '../graphBounds';

const makeBounds = (minX: number, minY: number, maxX: number, maxY: number) => ({
  minX,
  minY,
  maxX,
  maxY,
  width: maxX - minX,
  height: maxY - minY,
});

describe('expandBounds', () => {
  it('expands all sides by the given margin', () => {
    const b = makeBounds(10, 20, 30, 40);
    const expanded = expandBounds(b, 5);
    expect(expanded.minX).toBe(5);
    expect(expanded.minY).toBe(15);
    expect(expanded.maxX).toBe(35);
    expect(expanded.maxY).toBe(45);
    expect(expanded.width).toBe(30);
    expect(expanded.height).toBe(30);
  });

  it('handles zero margin', () => {
    const b = makeBounds(0, 0, 100, 100);
    expect(expandBounds(b, 0)).toEqual(b);
  });
});

describe('mergeBounds', () => {
  it('returns next when base is null', () => {
    const b = makeBounds(0, 0, 10, 10);
    expect(mergeBounds(null, b)).toBe(b);
  });

  it('returns base when next is null', () => {
    const b = makeBounds(0, 0, 10, 10);
    expect(mergeBounds(b, null)).toBe(b);
  });

  it('returns null when both are null', () => {
    expect(mergeBounds(null, null)).toBeNull();
  });

  it('merges two non-overlapping bounds into the encompassing rect', () => {
    const a = makeBounds(0, 0, 10, 10);
    const b = makeBounds(20, 30, 50, 60);
    const result = mergeBounds(a, b)!;
    expect(result.minX).toBe(0);
    expect(result.minY).toBe(0);
    expect(result.maxX).toBe(50);
    expect(result.maxY).toBe(60);
    expect(result.width).toBe(50);
    expect(result.height).toBe(60);
  });

  it('merges overlapping bounds correctly', () => {
    const a = makeBounds(5, 5, 20, 20);
    const b = makeBounds(10, 10, 30, 30);
    const result = mergeBounds(a, b)!;
    expect(result.minX).toBe(5);
    expect(result.maxX).toBe(30);
  });
});

describe('getEdgeLabelBounds', () => {
  it('returns null for edges with no labelPosition', () => {
    const edges = [{ id: 'e1', source: 'a', target: 'b', points: [] }] as any[];
    expect(getEdgeLabelBounds(edges)).toBeNull();
  });

  it('returns null for empty edge array', () => {
    expect(getEdgeLabelBounds([])).toBeNull();
  });

  it('computes bounds from a single edge label position', () => {
    const edges = [
      { id: 'e1', source: 'a', target: 'b', points: [], labelPosition: { x: 100, y: 50 } },
    ] as any[];
    const bounds = getEdgeLabelBounds(edges)!;
    expect(bounds).not.toBeNull();
    expect(bounds.minX).toBeLessThan(100);
    expect(bounds.maxX).toBeGreaterThan(100);
    expect(bounds.minY).toBeLessThan(50);
    expect(bounds.maxY).toBeGreaterThan(50);
  });

  it('merges bounds across multiple labeled edges', () => {
    const edges = [
      { id: 'e1', source: 'a', target: 'b', points: [], labelPosition: { x: 0, y: 0 } },
      { id: 'e2', source: 'b', target: 'c', points: [], labelPosition: { x: 200, y: 200 } },
    ] as any[];
    const bounds = getEdgeLabelBounds(edges)!;
    expect(bounds.minX).toBeLessThan(0);
    expect(bounds.maxX).toBeGreaterThan(200);
  });
});
