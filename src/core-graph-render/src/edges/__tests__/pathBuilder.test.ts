import type { PositionedEdge } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { buildEdgePath } from '../pathBuilder';

const makeEdge = (points: Array<{ x: number; y: number }>): PositionedEdge => ({
  id: 'e1',
  source: 'a',
  target: 'b',
  points,
});

describe('buildEdgePath', () => {
  it('returns null when edge has fewer than 2 points', () => {
    expect(buildEdgePath(makeEdge([]), true, 0.5)).toBeNull();
    expect(buildEdgePath(makeEdge([{ x: 0, y: 0 }]), true, 0.5)).toBeNull();
  });

  it('builds a straight path when curveEdges is false', () => {
    const edge = makeEdge([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ]);
    const path = buildEdgePath(edge, false, 0.5);
    expect(path).toContain('M 0 0');
    expect(path).toContain('L 100 0');
  });

  it('builds a straight line for two horizontal points even with curveEdges=true', () => {
    const edge = makeEdge([
      { x: 0, y: 10 },
      { x: 100, y: 10 },
    ]);
    const path = buildEdgePath(edge, true, 0.5);
    // same y → straight line fallback in buildTwoPointCurvedPath
    expect(path).toContain('M 0 10');
    expect(path).toContain('L 100 10');
  });

  it('builds a curved path for two non-horizontal points', () => {
    const edge = makeEdge([
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ]);
    const path = buildEdgePath(edge, true, 0.5);
    expect(path).toBeTruthy();
    expect(path).toContain('M 0 0');
    // two-point curve uses Q bezier commands
    expect(path).toContain('Q');
  });

  it('builds a quadratic bezier for 3-point edges', () => {
    const edge = makeEdge([
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 0 },
    ]);
    const path = buildEdgePath(edge, true, 0.5);
    expect(path).toMatch(/^M 0 0 Q 50 50 100 0$/);
  });

  it('builds a cubic bezier path for 6-point edges', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 40, y: 0 },
      { x: 60, y: 100 },
      { x: 90, y: 100 },
      { x: 100, y: 100 },
    ];
    const edge = makeEdge(points);
    const path = buildEdgePath(edge, true, 0.5);
    expect(path).toContain('M 0 0');
    expect(path).toContain('C');
    expect(path).toContain('L 100 100');
  });

  it('builds a multi-point path for 4-point edges', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 25, y: 0 },
      { x: 75, y: 100 },
      { x: 100, y: 100 },
    ];
    const edge = makeEdge(points);
    const path = buildEdgePath(edge, true, 0.5);
    expect(path).toContain('M 0 0');
    expect(path).toBeTruthy();
  });

  it('builds a straight multi-segment path for multiple points with curveEdges=false', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 100, y: 50 },
    ];
    const edge = makeEdge(points);
    const path = buildEdgePath(edge, false, 0.5);
    expect(path).toContain('M 0 0');
    expect(path).toContain('L 50 0');
    expect(path).toContain('L 100 50');
  });
});
