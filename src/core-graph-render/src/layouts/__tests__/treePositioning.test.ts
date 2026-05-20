import { LayoutDirection } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { calculateTreeMetrics, calculateXPosition, calculateYPosition } from '../treePositioning';

const makeNode = (id: string) => ({ id });

describe('calculateTreeMetrics', () => {
  it('returns zero maxLevel for empty levels', () => {
    const metrics = calculateTreeMetrics([], [], 32, 20);
    expect(metrics.maxLevel).toBe(0);
  });

  it('computes maxLevel = levels.length - 1', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const levels = [['a'], ['b'], ['c']];
    const metrics = calculateTreeMetrics(nodes, levels, 32, 20);
    expect(metrics.maxLevel).toBe(2);
  });

  it('computes maxLevelCount from the widest level', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c'), makeNode('d')];
    const levels = [['a'], ['b', 'c', 'd']];
    const metrics = calculateTreeMetrics(nodes, levels, 32, 20);
    expect(metrics.maxLevelCount).toBe(3);
  });

  it('uses containerHeight for baseY when provided', () => {
    const nodes = [makeNode('a')];
    const levels = [['a']];
    const metrics = calculateTreeMetrics(nodes, levels, 0, 20, 800);
    // totalHeight = 1 * maxNodeHeight + 0 * gap = maxNodeHeight (40 default)
    // centeredBaseY = (800 - 40) / 2 = 380; max(20, 380) = 380
    expect(metrics.baseY).toBeGreaterThan(20);
  });

  it('uses padding for baseY when containerHeight is undefined', () => {
    const nodes = [makeNode('a')];
    const levels = [['a']];
    const metrics = calculateTreeMetrics(nodes, levels, 32, 50, undefined);
    expect(metrics.baseY).toBe(50);
  });
});

describe('calculateXPosition', () => {
  it('returns padding for level=0 in LTR', () => {
    const x = calculateXPosition(0, 2, 100, 32, 20, LayoutDirection.LTR);
    expect(x).toBe(20);
  });

  it('increases x with each level in LTR', () => {
    const x0 = calculateXPosition(0, 2, 100, 32, 20, LayoutDirection.LTR);
    const x1 = calculateXPosition(1, 2, 100, 32, 20, LayoutDirection.LTR);
    expect(x1).toBeGreaterThan(x0);
  });

  it('returns padding for maxLevel in RTL', () => {
    const x = calculateXPosition(2, 2, 100, 32, 20, LayoutDirection.RTL);
    expect(x).toBe(20);
  });

  it('decreases x with each level in RTL (compared to LTR)', () => {
    const ltr = calculateXPosition(0, 2, 100, 32, 20, LayoutDirection.LTR);
    const rtl = calculateXPosition(0, 2, 100, 32, 20, LayoutDirection.RTL);
    expect(rtl).toBeGreaterThan(ltr);
  });
});

describe('calculateYPosition', () => {
  it('returns baseY for a single-node level at index 0', () => {
    const y = calculateYPosition(0, ['a'], 40, 32, 40, 20);
    // levelHeight = 1 * 40 + 0 * 32 = 40; levelStartY = 20 + (40 - 40)/2 = 20
    expect(y).toBe(20);
  });

  it('increments y for each node in a multi-node level', () => {
    const level = ['a', 'b', 'c'];
    const totalHeight = 3 * 40 + 2 * 32;
    const y0 = calculateYPosition(0, level, 40, 32, totalHeight, 0);
    const y1 = calculateYPosition(1, level, 40, 32, totalHeight, 0);
    expect(y1).toBeGreaterThan(y0);
    expect(y1 - y0).toBe(40 + 32);
  });
});
