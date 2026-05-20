import { describe, expect, it, vi } from 'vitest';

import { getPointerDistance, getPointerMidpoint, getRelativeSvgPoint } from '../pointer';

describe('getPointerDistance', () => {
  it('returns 0 for identical points', () => {
    expect(getPointerDistance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });

  it('calculates horizontal distance', () => {
    expect(getPointerDistance({ x: 0, y: 0 }, { x: 3, y: 0 })).toBeCloseTo(3);
  });

  it('calculates vertical distance', () => {
    expect(getPointerDistance({ x: 0, y: 0 }, { x: 0, y: 4 })).toBeCloseTo(4);
  });

  it('calculates diagonal distance (3-4-5 triangle)', () => {
    expect(getPointerDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5);
  });

  it('is symmetric', () => {
    const a = { x: 1, y: 2 };
    const b = { x: 5, y: 9 };
    expect(getPointerDistance(a, b)).toBeCloseTo(getPointerDistance(b, a));
  });
});

describe('getPointerMidpoint', () => {
  it('returns exact midpoint', () => {
    const mid = getPointerMidpoint({ x: 0, y: 0 }, { x: 10, y: 20 });
    expect(mid).toEqual({ x: 5, y: 10 });
  });

  it('handles negative coordinates', () => {
    const mid = getPointerMidpoint({ x: -10, y: -20 }, { x: 10, y: 20 });
    expect(mid).toEqual({ x: 0, y: 0 });
  });

  it('is symmetric', () => {
    const a = { x: 3, y: 7 };
    const b = { x: 9, y: 1 };
    expect(getPointerMidpoint(a, b)).toEqual(getPointerMidpoint(b, a));
  });
});

describe('getRelativeSvgPoint', () => {
  it('returns clientX/clientY when svg is null', () => {
    const result = getRelativeSvgPoint(null, 100, 200);
    expect(result).toEqual({ x: 100, y: 200 });
  });

  it('subtracts the SVG element bounding rect', () => {
    const svg = {
      getBoundingClientRect: vi.fn().mockReturnValue({ left: 50, top: 30 }),
    } as unknown as SVGSVGElement;
    const result = getRelativeSvgPoint(svg, 150, 130);
    expect(result).toEqual({ x: 100, y: 100 });
  });

  it('handles svg at origin', () => {
    const svg = {
      getBoundingClientRect: vi.fn().mockReturnValue({ left: 0, top: 0 }),
    } as unknown as SVGSVGElement;
    expect(getRelativeSvgPoint(svg, 50, 80)).toEqual({ x: 50, y: 80 });
  });
});
