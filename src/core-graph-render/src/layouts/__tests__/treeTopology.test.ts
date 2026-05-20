import { EdgeType } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import {
  assertHierarchicalGraph,
  assignDagLevels,
  assignNodesToLevels,
  buildGraphTopology,
  findRootNodes,
  groupNodesByLevel,
} from '../treeTopology';

const makeNode = (id: string) => ({ id });
const makeEdge = (id: string, source: string, target: string) => ({
  id,
  source,
  target,
  type: EdgeType.Directed,
});

describe('assertHierarchicalGraph', () => {
  it('does not throw for empty nodes', () => {
    expect(() => assertHierarchicalGraph([], [])).not.toThrow();
  });

  it('does not throw for a linear chain', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('e1', 'a', 'b')];
    expect(() => assertHierarchicalGraph(nodes, edges)).not.toThrow();
  });

  it('throws on a cyclic graph', () => {
    // Root a exists (inDegree=0), but b→c→b forms a downstream cycle
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'c'), makeEdge('e3', 'c', 'b')];
    expect(() => assertHierarchicalGraph(nodes, edges)).toThrow(
      'Tree layout requires an acyclic graph'
    );
  });

  it('throws on a disconnected graph with no root', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    // a→b→c→a cycle, no root
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'c'), makeEdge('e3', 'c', 'a')];
    expect(() => assertHierarchicalGraph(nodes, edges)).toThrow('at least one root node');
  });

  it('throws when an edge references a missing node', () => {
    const nodes = [makeNode('a')];
    const edges = [makeEdge('e1', 'a', 'missing')];
    expect(() => assertHierarchicalGraph(nodes, edges)).toThrow('Invalid edge: a -> missing');
  });
});

describe('buildGraphTopology', () => {
  it('builds empty topology for empty edges', () => {
    const topology = buildGraphTopology([]);
    expect(topology.incoming.size).toBe(0);
    expect(topology.outgoing.size).toBe(0);
  });

  it('counts incoming edges per node', () => {
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'a', 'b')];
    const topology = buildGraphTopology(edges);
    expect(topology.incoming.get('b')).toBe(2);
  });

  it('tracks outgoing edges per node', () => {
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'a', 'c')];
    const topology = buildGraphTopology(edges);
    expect(topology.outgoing.get('a')).toEqual(['b', 'c']);
  });
});

describe('findRootNodes', () => {
  it('returns all nodes when there are no edges', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const roots = findRootNodes(nodes, new Map());
    expect(roots).toContain('a');
    expect(roots).toContain('b');
  });

  it('returns only nodes with no incoming edges', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const incoming = new Map([
      ['b', 1],
      ['c', 1],
    ]);
    const roots = findRootNodes(nodes, incoming);
    expect(roots).toEqual(['a']);
  });
});

describe('assignNodesToLevels', () => {
  it('returns empty map for empty nodes', () => {
    const levelMap = assignNodesToLevels([], [], new Map());
    expect(levelMap.size).toBe(0);
  });

  it('assigns level 0 to root and level 1 to children', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const outgoing = new Map([['a', ['b']]]);
    const levelMap = assignNodesToLevels(nodes, ['a'], outgoing);
    expect(levelMap.get('a')).toBe(0);
    expect(levelMap.get('b')).toBe(1);
  });

  it('assigns levels in a 3-level chain', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const outgoing = new Map([
      ['a', ['b']],
      ['b', ['c']],
    ]);
    const levelMap = assignNodesToLevels(nodes, ['a'], outgoing);
    expect(levelMap.get('a')).toBe(0);
    expect(levelMap.get('b')).toBe(1);
    expect(levelMap.get('c')).toBe(2);
  });
});

describe('assignDagLevels', () => {
  it('returns empty maps for empty nodes', () => {
    const result = assignDagLevels([], []);
    expect(result.levels.size).toBe(0);
    expect(result.outgoing.size).toBe(0);
  });

  it('assigns max-depth levels for a diamond DAG', () => {
    // a→b, a→c, b→d, c→d — d is at level 2 (max of b+1 and c+1)
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c'), makeNode('d')];
    const edges = [
      makeEdge('e1', 'a', 'b'),
      makeEdge('e2', 'a', 'c'),
      makeEdge('e3', 'b', 'd'),
      makeEdge('e4', 'c', 'd'),
    ];
    const { levels } = assignDagLevels(nodes, edges);
    expect(levels.get('a')).toBe(0);
    expect(levels.get('d')).toBe(2);
  });

  it('throws on cycles', () => {
    // Root a exists (inDegree=0), but b→c→b forms a downstream cycle
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'c'), makeEdge('e3', 'c', 'b')];
    expect(() => assignDagLevels(nodes, edges)).toThrow('Cycles were detected');
  });
});

describe('groupNodesByLevel', () => {
  it('throws when a node has no level assignment', () => {
    const nodes = [makeNode('orphan')];
    expect(() => groupNodesByLevel(nodes, new Map())).toThrow('"orphan"');
  });

  it('groups two nodes at different levels', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const levelMap = new Map([
      ['a', 0],
      ['b', 1],
    ]);
    const groups = groupNodesByLevel(nodes, levelMap);
    expect(groups[0]).toContain('a');
    expect(groups[1]).toContain('b');
  });

  it('groups two nodes at the same level', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const levelMap = new Map([
      ['a', 0],
      ['b', 0],
    ]);
    const groups = groupNodesByLevel(nodes, levelMap);
    expect(groups[0]).toContain('a');
    expect(groups[0]).toContain('b');
  });
});
