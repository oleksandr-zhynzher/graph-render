import { EdgeType } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { radialTreeLayout } from '../radialTree';

const makeNode = (id: string) => ({ id });
const makeEdge = (id: string, source: string, target: string) => ({
  id,
  source,
  target,
  type: EdgeType.Directed,
});

describe('radialTreeLayout', () => {
  it('returns empty array for empty nodes', () => {
    expect(radialTreeLayout([], [])).toHaveLength(0);
  });

  it('falls back to centeredLayout when no edges', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const result = radialTreeLayout(nodes, []);
    // centeredLayout returns circular arrangement
    expect(result).toHaveLength(3);
    for (const n of result) {
      expect(n).toHaveProperty('position');
    }
  });

  it('positions root node at center for a simple tree', () => {
    const nodes = [makeNode('root'), makeNode('child')];
    const edges = [makeEdge('e1', 'root', 'child')];
    const result = radialTreeLayout(nodes, edges, 20, 960, 720);
    const root = result.find((n) => n.id === 'root')!;
    // Root (level 0) is positioned at center minus half DEFAULT_NODE_SIZE (180×72)
    expect(root.position.x).toBeCloseTo(960 / 2 - 90, 0); // center - half default width
    expect(root.position.y).toBeCloseTo(720 / 2 - 36, 0); // center - half default height
  });

  it('positions children at non-center positions', () => {
    const nodes = [makeNode('root'), makeNode('c1'), makeNode('c2')];
    const edges = [makeEdge('e1', 'root', 'c1'), makeEdge('e2', 'root', 'c2')];
    const result = radialTreeLayout(nodes, edges, 20, 960, 720);
    const root = result.find((n) => n.id === 'root')!;
    const c1 = result.find((n) => n.id === 'c1')!;
    const c2 = result.find((n) => n.id === 'c2')!;
    // Children should not be at the same position as root
    expect(c1.position).not.toEqual(root.position);
    expect(c2.position).not.toEqual(root.position);
    expect(c1.position).not.toEqual(c2.position);
  });

  it('throws on a cyclic graph', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'a')];
    expect(() => radialTreeLayout(nodes, edges)).toThrow();
  });
});
