import { NodeSide, RoutingStyle } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { calculateOrthogonalPoints } from '../orthogonal';

// Helper to get the center of a node box (position is top-left corner)
const center = (x: number, y: number, w: number, h: number) => ({
  x: x + w / 2,
  y: y + h / 2,
});

// Helper to get the boundary point on a given side of a node box
const boundary = (x: number, y: number, w: number, h: number, side: NodeSide) => {
  const cx = x + w / 2;
  const cy = y + h / 2;
  if (side === NodeSide.Right) return { x: x + w, y: cy };
  if (side === NodeSide.Left) return { x, y: cy };
  if (side === NodeSide.Bottom) return { x: cx, y: y + h };
  return { x: cx, y };
};

describe('calculateOrthogonalPoints', () => {
  it('returns exactly 6 points for a left-to-right connection', () => {
    // source at (0,0) 100×50, target at (200,0) 100×50
    const startPoint = boundary(0, 0, 100, 50, NodeSide.Right); // {x:100, y:25}
    const endPoint = boundary(200, 0, 100, 50, NodeSide.Left); // {x:200, y:25}
    const sourceCenter = center(0, 0, 100, 50);
    const targetCenter = center(200, 0, 100, 50);
    const points = calculateOrthogonalPoints(
      startPoint,
      endPoint,
      sourceCenter,
      targetCenter,
      RoutingStyle.Orthogonal,
      0,
      NodeSide.Right,
      NodeSide.Left
    );
    expect(points).toHaveLength(6);
  });

  it('returns exactly 6 points for a top-to-bottom connection', () => {
    const startPoint = boundary(0, 0, 100, 50, NodeSide.Bottom); // {x:50, y:50}
    const endPoint = boundary(0, 200, 100, 50, NodeSide.Top); // {x:50, y:200}
    const sourceCenter = center(0, 0, 100, 50);
    const targetCenter = center(0, 200, 100, 50);
    const points = calculateOrthogonalPoints(
      startPoint,
      endPoint,
      sourceCenter,
      targetCenter,
      RoutingStyle.Orthogonal,
      0,
      NodeSide.Bottom,
      NodeSide.Top
    );
    expect(points).toHaveLength(6);
  });

  it('all points have finite x and y coordinates', () => {
    const startPoint = boundary(0, 0, 100, 50, NodeSide.Right);
    const endPoint = boundary(200, 100, 100, 50, NodeSide.Left);
    const sourceCenter = center(0, 0, 100, 50);
    const targetCenter = center(200, 100, 100, 50);
    const points = calculateOrthogonalPoints(
      startPoint,
      endPoint,
      sourceCenter,
      targetCenter,
      RoutingStyle.Orthogonal,
      0,
      NodeSide.Right,
      NodeSide.Left
    );
    for (const pt of points) {
      expect(Number.isFinite(pt.x)).toBe(true);
      expect(Number.isFinite(pt.y)).toBe(true);
    }
  });

  it('first point starts at the source node boundary', () => {
    // Right side of (0,0,100,50): x=100, y=25
    const startPoint = boundary(0, 0, 100, 50, NodeSide.Right);
    const endPoint = boundary(200, 0, 100, 50, NodeSide.Left);
    const sourceCenter = center(0, 0, 100, 50);
    const targetCenter = center(200, 0, 100, 50);
    const points = calculateOrthogonalPoints(
      startPoint,
      endPoint,
      sourceCenter,
      targetCenter,
      RoutingStyle.Orthogonal,
      0,
      NodeSide.Right,
      NodeSide.Left
    );
    expect(points[0]!.x).toBe(100);
    expect(points[0]!.y).toBe(25);
  });

  it('last point ends at the target node boundary', () => {
    // Left side of (200,0,100,50): x=200, y=25
    const startPoint = boundary(0, 0, 100, 50, NodeSide.Right);
    const endPoint = boundary(200, 0, 100, 50, NodeSide.Left);
    const sourceCenter = center(0, 0, 100, 50);
    const targetCenter = center(200, 0, 100, 50);
    const points = calculateOrthogonalPoints(
      startPoint,
      endPoint,
      sourceCenter,
      targetCenter,
      RoutingStyle.Orthogonal,
      0,
      NodeSide.Right,
      NodeSide.Left
    );
    expect(points[5]!.x).toBe(200);
    expect(points[5]!.y).toBe(25);
  });

  it('intermediate points form an orthogonal path (right angles)', () => {
    const startPoint = boundary(0, 0, 100, 50, NodeSide.Right);
    const endPoint = boundary(200, 100, 100, 50, NodeSide.Left);
    const sourceCenter = center(0, 0, 100, 50);
    const targetCenter = center(200, 100, 100, 50);
    const points = calculateOrthogonalPoints(
      startPoint,
      endPoint,
      sourceCenter,
      targetCenter,
      RoutingStyle.Orthogonal,
      0,
      NodeSide.Right,
      NodeSide.Left
    );
    for (let i = 1; i < points.length; i++) {
      const dx = points[i]!.x - points[i - 1]!.x;
      const dy = points[i]!.y - points[i - 1]!.y;
      expect(dx === 0 || dy === 0).toBe(true);
    }
  });
});
