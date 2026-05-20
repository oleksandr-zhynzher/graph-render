import { describe, expect, it } from 'vitest';

import { groupPositionedNodesByColumn } from '../columns';

const makeNode = (id: string, x: number, y: number, width = 180) =>
  ({
    id,
    position: { x, y },
    size: { width, height: 72 },
  }) as any;

describe('groupPositionedNodesByColumn', () => {
  it('returns empty array for empty input', () => {
    expect(groupPositionedNodesByColumn([])).toEqual([]);
  });

  it('creates a single column for one node', () => {
    const result = groupPositionedNodesByColumn([makeNode('a', 0, 0)]);
    expect(result).toHaveLength(1);
    expect(result[0]!.nodes).toHaveLength(1);
  });

  it('groups two nodes with the same center x into one column', () => {
    const n1 = makeNode('a', 0, 0);
    const n2 = makeNode('b', 0, 100);
    const result = groupPositionedNodesByColumn([n1, n2]);
    expect(result).toHaveLength(1);
    expect(result[0]!.nodes).toHaveLength(2);
  });

  it('creates separate columns for nodes far apart horizontally', () => {
    const n1 = makeNode('a', 0, 0);
    const n2 = makeNode('b', 600, 0);
    const result = groupPositionedNodesByColumn([n1, n2]);
    expect(result).toHaveLength(2);
  });

  it('sorts nodes within a column by y position ascending', () => {
    const n1 = makeNode('a', 0, 200);
    const n2 = makeNode('b', 0, 50);
    const n3 = makeNode('c', 0, 100);
    const [col] = groupPositionedNodesByColumn([n1, n2, n3]);
    expect(col!.nodes.map((n: any) => n.id)).toEqual(['b', 'c', 'a']);
  });

  it('returns columns sorted left to right by centerX', () => {
    const n1 = makeNode('a', 600, 0);
    const n2 = makeNode('b', 0, 0);
    const result = groupPositionedNodesByColumn([n1, n2]);
    expect(result[0]!.centerX).toBeLessThan(result[1]!.centerX);
  });

  it('computes centerX as x + width/2', () => {
    const result = groupPositionedNodesByColumn([makeNode('a', 10, 0, 180)]);
    expect(result[0]!.centerX).toBeCloseTo(100);
  });

  it('groups nodes within the default tolerance', () => {
    // default tolerance = 24; 10px apart should be one column
    const n1 = makeNode('a', 0, 0, 180); // centerX = 90
    const n2 = makeNode('b', 10, 100, 180); // centerX = 100
    const result = groupPositionedNodesByColumn([n1, n2]);
    expect(result).toHaveLength(1);
  });

  it('respects a custom tolerance value', () => {
    // threshold = Math.max(tolerance, nodeWidth * 0.35) = Math.max(0, 10 * 0.35) = 3.5
    // Nodes must be > 3.5 apart in centerX to be split into separate columns with tolerance=0
    const n1 = makeNode('a', 0, 0, 10); // centerX = 5
    const n2 = makeNode('b', 5, 0, 10); // centerX = 10, difference = 5 > 3.5
    const result = groupPositionedNodesByColumn([n1, n2], 0);
    expect(result).toHaveLength(2);
  });

  it('groups nodes within nodeWidth * 0.35 even with tolerance=0', () => {
    // difference = 2, threshold = max(0, 10 * 0.35) = 3.5 => same column
    const n1 = makeNode('a', 0, 0, 10); // centerX = 5
    const n2 = makeNode('b', 2, 0, 10); // centerX = 7, difference = 2 < 3.5
    const result = groupPositionedNodesByColumn([n1, n2], 0);
    expect(result).toHaveLength(1);
  });

  it('handles nodes without an explicit size', () => {
    const node = { id: 'x', position: { x: 0, y: 0 } } as any;
    expect(() => groupPositionedNodesByColumn([node])).not.toThrow();
    expect(groupPositionedNodesByColumn([node])).toHaveLength(1);
  });
});
