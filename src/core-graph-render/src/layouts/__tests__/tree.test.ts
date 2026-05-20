import { EdgeType, LayoutDirection } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { treeLayout } from '../tree';

const makeNode = (id: string) => ({ id });
const makeEdge = (id: string, source: string, target: string) => ({
  id,
  source,
  target,
  type: EdgeType.Directed,
});

describe('treeLayout', () => {
  it('returns empty array for empty nodes', () => {
    expect(treeLayout([], [])).toHaveLength(0);
  });

  it('positions a linear chain', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'c')];
    const result = treeLayout(nodes, edges);
    expect(result).toHaveLength(3);
    for (const n of result) {
      expect(Number.isFinite(n.position.x)).toBe(true);
      expect(Number.isFinite(n.position.y)).toBe(true);
    }
  });

  it('root node gets the leftmost x position in LTR direction', () => {
    const nodes = [makeNode('root'), makeNode('child')];
    const edges = [makeEdge('e1', 'root', 'child')];
    const result = treeLayout(nodes, edges, 0, 32, LayoutDirection.LTR);
    const root = result.find((n) => n.id === 'root')!;
    const child = result.find((n) => n.id === 'child')!;
    expect(root.position.x).toBeLessThan(child.position.x);
  });

  it('throws on a cycle', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'a')];
    expect(() => treeLayout(nodes, edges)).toThrow();
  });

  it('throws when an edge references a nonexistent node', () => {
    const nodes = [makeNode('a')];
    const edges = [makeEdge('e1', 'a', 'missing')];
    expect(() => treeLayout(nodes, edges)).toThrow();
  });

  it('positions a tree in RTL direction', () => {
    const nodes = [makeNode('root'), makeNode('child')];
    const edges = [makeEdge('e1', 'root', 'child')];
    const result = treeLayout(nodes, edges, 0, 32, LayoutDirection.RTL);
    const root = result.find((n) => n.id === 'root')!;
    const child = result.find((n) => n.id === 'child')!;
    expect(root.position.x).toBeGreaterThan(child.position.x);
  });
});
