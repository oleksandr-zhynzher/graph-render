import { EdgeType, LayoutDirection } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { dagLayout } from '../dag';

const makeNode = (id: string) => ({ id });
const makeEdge = (id: string, source: string, target: string) => ({
  id,
  source,
  target,
  type: EdgeType.Directed,
});

describe('dagLayout', () => {
  it('returns an empty array for empty nodes', () => {
    expect(dagLayout([], [])).toHaveLength(0);
  });

  it('positions all nodes in a linear chain', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'c')];
    const result = dagLayout(nodes, edges);
    expect(result).toHaveLength(3);
    for (const n of result) {
      expect(n).toHaveProperty('position');
      expect(Number.isFinite(n.position.x)).toBe(true);
      expect(Number.isFinite(n.position.y)).toBe(true);
    }
  });

  it('assigns increasing x positions from left to right (LTR)', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'c')];
    const result = dagLayout(nodes, edges, 20, 32, LayoutDirection.LTR);
    const nodeA = result.find((n) => n.id === 'a')!;
    const nodeB = result.find((n) => n.id === 'b')!;
    const nodeC = result.find((n) => n.id === 'c')!;
    expect(nodeA.position.x).toBeLessThan(nodeB.position.x);
    expect(nodeB.position.x).toBeLessThan(nodeC.position.x);
  });

  it('assigns decreasing x positions from right to left (RTL)', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('e1', 'a', 'b')];
    const result = dagLayout(nodes, edges, 20, 32, LayoutDirection.RTL);
    const nodeA = result.find((n) => n.id === 'a')!;
    const nodeB = result.find((n) => n.id === 'b')!;
    expect(nodeA.position.x).toBeGreaterThan(nodeB.position.x);
  });

  it('positions isolated nodes (no edges)', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const result = dagLayout(nodes, []);
    expect(result).toHaveLength(2);
  });
});
