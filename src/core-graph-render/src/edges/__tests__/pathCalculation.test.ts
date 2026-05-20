import { describe, expect, it } from 'vitest';

import {
  calculateControlPoints,
  calculateStraightPoints,
  getLeadOutDistance,
} from '../pathCalculation';

describe('getLeadOutDistance', () => {
  it('returns 28 for straight directed edges', () => {
    expect(getLeadOutDistance(true, false)).toBe(28);
  });

  it('returns 8 for undirected edges (straight or not)', () => {
    expect(getLeadOutDistance(true, true)).toBe(8);
    expect(getLeadOutDistance(false, true)).toBe(8);
  });

  it('returns 10 for non-straight directed edges', () => {
    expect(getLeadOutDistance(false, false)).toBe(10);
  });
});

describe('calculateControlPoints', () => {
  const startPoint = { x: 0, y: 0 };
  const endPoint = { x: 100, y: 0 };
  const sourceNormal = { x: 1, y: 0 };
  const targetNormal = { x: -1, y: 0 };

  it('returns 6 points for a directed edge', () => {
    const points = calculateControlPoints(
      startPoint,
      endPoint,
      sourceNormal,
      targetNormal,
      10,
      false
    );
    expect(points).toHaveLength(6);
  });

  it('first point is startPoint', () => {
    const points = calculateControlPoints(
      startPoint,
      endPoint,
      sourceNormal,
      targetNormal,
      10,
      false
    );
    expect(points[0]).toEqual(startPoint);
  });

  it('last point is endPoint', () => {
    const points = calculateControlPoints(
      startPoint,
      endPoint,
      sourceNormal,
      targetNormal,
      10,
      false
    );
    expect(points[5]).toEqual(endPoint);
  });

  it('second point is offset from startPoint by leadOut along sourceNormal', () => {
    const points = calculateControlPoints(
      startPoint,
      endPoint,
      sourceNormal,
      targetNormal,
      10,
      false
    );
    expect(points[1]).toEqual({ x: 10, y: 0 });
  });

  it('uses smaller endStraight for undirected edges', () => {
    const directed = calculateControlPoints(
      startPoint,
      endPoint,
      sourceNormal,
      targetNormal,
      10,
      false
    );
    const undirected = calculateControlPoints(
      startPoint,
      endPoint,
      sourceNormal,
      targetNormal,
      10,
      true
    );
    // undirected endStraight=10, directed endStraight=20; point[4] is endStraightStart
    expect((directed[4] as { x: number; y: number }).x).toBeGreaterThan(
      (undirected[4] as { x: number; y: number }).x
    );
  });
});

describe('calculateStraightPoints', () => {
  const startPoint = { x: 0, y: 0 };
  const endPoint = { x: 100, y: 0 };
  const sourceNormal = { x: 1, y: 0 };
  const targetNormal = { x: -1, y: 0 };

  it('returns 4 points for straight routing', () => {
    const points = calculateStraightPoints(
      startPoint,
      endPoint,
      sourceNormal,
      targetNormal,
      10,
      false
    );
    expect(points).toHaveLength(4);
  });

  it('first point is startPoint', () => {
    const points = calculateStraightPoints(
      startPoint,
      endPoint,
      sourceNormal,
      targetNormal,
      10,
      false
    );
    expect(points[0]).toEqual(startPoint);
  });

  it('last point is endPoint', () => {
    const points = calculateStraightPoints(
      startPoint,
      endPoint,
      sourceNormal,
      targetNormal,
      10,
      false
    );
    expect(points[3]).toEqual(endPoint);
  });

  it('second point is leadOut offset from start', () => {
    const points = calculateStraightPoints(
      startPoint,
      endPoint,
      sourceNormal,
      targetNormal,
      10,
      false
    );
    expect(points[1]).toEqual({ x: 10, y: 0 });
  });
});
