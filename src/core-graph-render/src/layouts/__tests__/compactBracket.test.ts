import { EdgeType, LayoutDirection } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { compactBracketLayout } from '../compactBracket';
import { treeLayout } from '../tree';

const makeNode = (id: string) => ({ id });
const makeEdge = (id: string, source: string, target: string) => ({
  id,
  source,
  target,
  type: EdgeType.Directed,
});

describe('compactBracketLayout', () => {
  it('returns empty array for empty nodes', () => {
    expect(compactBracketLayout([], [])).toHaveLength(0);
  });

  it('delegates to treeLayout with a reduced gap', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('e1', 'a', 'b')];
    const gap = 60;
    // compactBracketLayout uses Math.max(28, gap * 0.55) = Math.max(28, 33) = 33
    const compactResult = compactBracketLayout(nodes, edges, 20, gap, LayoutDirection.LTR);
    const treeResult = treeLayout(nodes, edges, 20, Math.max(28, gap * 0.55), LayoutDirection.LTR);
    // Both should return the same positions
    const sortById = (arr: ReadonlyArray<{ id: string; position: { x: number; y: number } }>) =>
      [...arr].sort((a, b) => a.id.localeCompare(b.id));
    const compact = sortById(compactResult);
    const tree = sortById(treeResult);
    for (const [i, element] of compact.entries()) {
      expect(element.position).toEqual(tree[i]!.position);
    }
  });

  it('uses gap=28 when supplied gap*0.55 < 28', () => {
    const nodes = [makeNode('root'), makeNode('child')];
    const edges = [makeEdge('e1', 'root', 'child')];
    // gap=10 → 10*0.55=5.5 < 28, so effective gap=28
    const compactResult = compactBracketLayout(nodes, edges, 20, 10);
    const treeResult = treeLayout(nodes, edges, 20, 28);
    const sortById = (arr: ReadonlyArray<{ id: string; position: { x: number; y: number } }>) =>
      [...arr].sort((a, b) => a.id.localeCompare(b.id));
    expect(sortById(compactResult)).toEqual(sortById(treeResult));
  });

  it('throws on cyclic graphs (delegates to treeLayout)', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'a')];
    expect(() => compactBracketLayout(nodes, edges)).toThrow();
  });
});
