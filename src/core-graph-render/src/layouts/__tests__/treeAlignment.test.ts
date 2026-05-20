import { EdgeType, LayoutDirection } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { alignNodesToParents, positionNodesInLevels } from '../treeAlignment';
import { calculateTreeMetrics } from '../treePositioning';

const makeNode = (id: string, extra: Record<string, unknown> = {}) => ({ id, ...extra });
const makeEdge = (id: string, source: string, target: string) => ({
  id,
  source,
  target,
  type: EdgeType.Directed,
});

describe('positionNodesInLevels', () => {
  it('assigns positions to all nodes', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const levels = [['a'], ['b']];
    const levelMap = new Map([
      ['a', 0],
      ['b', 1],
    ]);
    const metrics = calculateTreeMetrics(nodes, levels, 32, 20);
    const result = positionNodesInLevels(
      nodes,
      levels,
      levelMap,
      metrics,
      32,
      20,
      LayoutDirection.LTR
    );
    expect(result).toHaveLength(2);
    for (const n of result) {
      expect(n).toHaveProperty('position');
      expect(Number.isFinite(n.position.x)).toBe(true);
      expect(Number.isFinite(n.position.y)).toBe(true);
    }
  });

  it('preserves a node that already has a position', () => {
    const nodes = [{ id: 'a', position: { x: 10, y: 20 } }];
    const levels = [['a']];
    const levelMap = new Map([['a', 0]]);
    const metrics = calculateTreeMetrics(nodes, levels, 32, 20);
    const result = positionNodesInLevels(
      nodes,
      levels,
      levelMap,
      metrics,
      32,
      20,
      LayoutDirection.LTR
    );
    expect(result[0]!.position).toEqual({ x: 10, y: 20 });
  });

  it('level-0 nodes get a smaller x than level-1 nodes in LTR', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const levels = [['a'], ['b']];
    const levelMap = new Map([
      ['a', 0],
      ['b', 1],
    ]);
    const metrics = calculateTreeMetrics(nodes, levels, 32, 20);
    const result = positionNodesInLevels(
      nodes,
      levels,
      levelMap,
      metrics,
      32,
      20,
      LayoutDirection.LTR
    );
    const nodeA = result.find((n) => n.id === 'a')!;
    const nodeB = result.find((n) => n.id === 'b')!;
    expect(nodeA.position.x).toBeLessThan(nodeB.position.x);
  });
});

describe('alignNodesToParents', () => {
  it('returns the same nodes when no node has multiple parents', () => {
    const positioned = [
      { ...makeNode('a'), position: { x: 0, y: 0 } },
      { ...makeNode('b'), position: { x: 100, y: 0 } },
    ] as Parameters<typeof alignNodesToParents>[0];
    const edges = [makeEdge('e1', 'a', 'b')];
    const levels = [['a'], ['b']];
    const result = alignNodesToParents(positioned, edges, levels, 1);
    expect(result).toHaveLength(2);
  });

  it('centers a node with two parents on their average y', () => {
    const parentA = {
      ...makeNode('pa'),
      position: { x: 0, y: 0 },
      size: { width: 100, height: 40 },
    };
    const parentB = {
      ...makeNode('pb'),
      position: { x: 0, y: 100 },
      size: { width: 100, height: 40 },
    };
    const child = {
      ...makeNode('c'),
      position: { x: 200, y: 200 },
      size: { width: 100, height: 40 },
    };
    const positioned = [parentA, parentB, child] as Parameters<typeof alignNodesToParents>[0];
    const edges = [makeEdge('e1', 'pa', 'c'), makeEdge('e2', 'pb', 'c')];
    const levels = [['pa', 'pb'], ['c']];
    const result = alignNodesToParents(positioned, edges, levels, 1);
    const childResult = result.find((n) => n.id === 'c')!;
    // avgCenterY = (0+20 + 100+20)/2 = 70; newY = 70 - 20 = 50
    expect(childResult.position.y).toBeCloseTo(50, 0);
  });
});
