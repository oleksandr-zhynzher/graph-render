import { EdgeType, LayoutDirection } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { orthogonalFlowLayout } from '../orthogonalFlow';

const makeNode = (id: string) => ({ id });
const makeEdge = (id: string, source: string, target: string) => ({
  id,
  source,
  target,
  type: EdgeType.Directed,
});

describe('orthogonalFlowLayout', () => {
  it('returns empty array for empty nodes', () => {
    expect(orthogonalFlowLayout([], [])).toHaveLength(0);
  });

  it('positions all nodes in a LTR chain', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'c')];
    const result = orthogonalFlowLayout(nodes, edges, 20, 32, LayoutDirection.LTR);
    expect(result).toHaveLength(3);
    for (const n of result) {
      expect(Number.isFinite(n.position.x)).toBe(true);
      expect(Number.isFinite(n.position.y)).toBe(true);
    }
  });

  it('assigns increasing x positions in LTR', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('e1', 'a', 'b')];
    const result = orthogonalFlowLayout(nodes, edges, 20, 32, LayoutDirection.LTR);
    const nodeA = result.find((n) => n.id === 'a')!;
    const nodeB = result.find((n) => n.id === 'b')!;
    expect(nodeA.position.x).toBeLessThan(nodeB.position.x);
  });

  it('assigns decreasing x positions in RTL', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('e1', 'a', 'b')];
    const result = orthogonalFlowLayout(nodes, edges, 20, 32, LayoutDirection.RTL, 960, 720);
    const nodeA = result.find((n) => n.id === 'a')!;
    const nodeB = result.find((n) => n.id === 'b')!;
    expect(nodeA.position.x).toBeGreaterThan(nodeB.position.x);
  });

  it('handles isolated nodes (no edges)', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const result = orthogonalFlowLayout(nodes, []);
    expect(result).toHaveLength(2);
  });
});
