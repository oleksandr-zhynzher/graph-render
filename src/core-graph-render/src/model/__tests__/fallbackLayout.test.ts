import { LayoutType } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { buildFallbackLayout } from '../fallbackLayout';

const makeNode = (id: string) => ({ id });

describe('buildFallbackLayout', () => {
  it('returns empty array for empty nodes', () => {
    const result = buildFallbackLayout({ nodes: [], edges: [], layout: LayoutType.Grid });
    expect(result).toHaveLength(0);
  });

  it('returns positioned nodes for a non-empty graph', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const result = buildFallbackLayout({ nodes, edges: [], layout: LayoutType.Grid });
    expect(result).toHaveLength(2);
    for (const n of result) {
      expect(n).toHaveProperty('position');
      expect(Number.isFinite(n.position.x)).toBe(true);
      expect(Number.isFinite(n.position.y)).toBe(true);
    }
  });

  it('always uses Centered layout regardless of input layout', () => {
    const nodes = [makeNode('a')];
    // Using a different layout type should still produce a centered result
    const resultGrid = buildFallbackLayout({ nodes, edges: [], layout: LayoutType.Grid });
    const resultCentered = buildFallbackLayout({ nodes, edges: [], layout: LayoutType.Centered });
    // Both should produce the same single-node position (centered layout)
    expect(resultGrid[0]!.position).toEqual(resultCentered[0]!.position);
  });

  it('assigns positions to all nodes', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const result = buildFallbackLayout({ nodes, edges: [], layout: LayoutType.Centered });
    expect(result.every((n) => n.position !== undefined)).toBe(true);
  });
});
