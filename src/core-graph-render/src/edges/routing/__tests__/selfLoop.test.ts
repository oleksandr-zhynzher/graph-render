import { describe, expect, it } from 'vitest';

import { createSelfLoopPoints } from '../selfLoop';

const makeNode = (x = 0, y = 0) => ({
  id: 'n1',
  position: { x, y },
  size: { width: 100, height: 50 },
});

describe('createSelfLoopPoints', () => {
  it('returns exactly 5 points', () => {
    const node = makeNode(0, 0);
    const points = createSelfLoopPoints(node, node.size, 32, 0);
    expect(points).toHaveLength(5);
  });

  it('all points are finite numbers', () => {
    const node = makeNode(50, 50);
    const points = createSelfLoopPoints(node, node.size, 32, 0);
    for (const pt of points) {
      expect(Number.isFinite(pt.x)).toBe(true);
      expect(Number.isFinite(pt.y)).toBe(true);
    }
  });

  it('first point x is near the right edge of the node', () => {
    const node = makeNode(0, 0);
    const points = createSelfLoopPoints(node, node.size, 32, 0);
    // anchorX = right - min(width*0.2, 16) = 100 - 16 = 84
    expect(points[0]!.x).toBeCloseTo(84, 0);
  });

  it('loop extends to the right of the node', () => {
    const node = makeNode(0, 0);
    const points = createSelfLoopPoints(node, node.size, 32, 0);
    const rightEdge = node.position.x + node.size.width;
    // The loop control points should be to the right of the node
    const maxX = Math.max(...points.map((p) => p.x));
    expect(maxX).toBeGreaterThan(rightEdge);
  });

  it('non-zero offset shifts the loop', () => {
    const node = makeNode(0, 0);
    const withoutOffset = createSelfLoopPoints(node, node.size, 32, 0);
    const withOffset = createSelfLoopPoints(node, node.size, 32, 20);
    // The loop x position changes with offset
    expect(withOffset[2]!.x).not.toBe(withoutOffset[2]!.x);
  });
});
