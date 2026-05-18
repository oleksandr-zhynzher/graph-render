import { describe, expect, it } from 'vitest';

import { centeredLayout } from '../centered';

const makeNode = (id: string, extra: Record<string, unknown> = {}) => ({ id, ...extra });

describe('centeredLayout', () => {
  it('returns an empty array for empty input', () => {
    expect(centeredLayout([])).toHaveLength(0);
  });

  it('centers a single node in the viewport', () => {
    const nodes = [makeNode('a', { size: { width: 100, height: 50 } })];
    const result = centeredLayout(nodes, 0, 960, 720);
    // Center: (480, 360); node centered: x=480-50=430, y=360-25=335
    expect(result[0]!.position.x).toBeCloseTo(430, 0);
    expect(result[0]!.position.y).toBeCloseTo(335, 0);
  });

  it('distributes multiple nodes on a circle', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const result = centeredLayout(nodes, 20, 960, 720);
    expect(result).toHaveLength(3);
    // All positions should be defined
    for (const n of result) {
      expect(n).toHaveProperty('position');
      expect(Number.isFinite(n.position.x)).toBe(true);
      expect(Number.isFinite(n.position.y)).toBe(true);
    }
  });

  it('preserves an existing position', () => {
    const nodes = [{ id: 'a', position: { x: 10, y: 20 } }, makeNode('b'), makeNode('c')];
    const result = centeredLayout(nodes, 20, 960, 720);
    const nodeA = result.find((n) => n.id === 'a')!;
    expect(nodeA.position).toEqual({ x: 10, y: 20 });
  });

  it('falls back to gridLayout when radius is zero (tiny viewport)', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    // With a 1×1 viewport and huge padding, radius will be 0 → falls back to grid
    const result = centeredLayout(nodes, 600, 100, 100);
    expect(result).toHaveLength(2);
    for (const n of result) {
      expect(Number.isFinite(n.position.x)).toBe(true);
      expect(Number.isFinite(n.position.y)).toBe(true);
    }
  });
});
