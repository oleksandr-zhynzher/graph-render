import { describe, expect, it } from 'vitest';

import { isFiniteNumber, isPlainObject } from '../guards';

describe('isPlainObject', () => {
  it('returns true for a plain object literal', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1, b: 'str' })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isPlainObject(null)).toBe(false);
  });

  it('returns false for arrays', () => {
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject([1, 2, 3])).toBe(false);
  });

  it('returns false for primitive values', () => {
    expect(isPlainObject(42)).toBe(false);
    expect(isPlainObject('string')).toBe(false);
    expect(isPlainObject(true)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
  });

  it('returns true for non-plain class instances because the check only guards null/array', () => {
    // The implementation uses typeof+null+Array.isArray — class instances pass all three checks
    expect(isPlainObject(new Map())).toBe(true);
    expect(isPlainObject(new Date())).toBe(true);
  });
});

describe('isFiniteNumber', () => {
  it('returns true for finite integers', () => {
    expect(isFiniteNumber(0)).toBe(true);
    expect(isFiniteNumber(-5)).toBe(true);
    expect(isFiniteNumber(100)).toBe(true);
  });

  it('returns true for finite floats', () => {
    expect(isFiniteNumber(3.14)).toBe(true);
    expect(isFiniteNumber(-0.001)).toBe(true);
  });

  it('returns false for NaN', () => {
    expect(isFiniteNumber(Number.NaN)).toBe(false);
  });

  it('returns false for Infinity', () => {
    expect(isFiniteNumber(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isFiniteNumber(Number.NEGATIVE_INFINITY)).toBe(false);
  });

  it('returns false for non-number types', () => {
    expect(isFiniteNumber('42')).toBe(false);
    expect(isFiniteNumber(null)).toBe(false);
    expect(isFiniteNumber(undefined)).toBe(false);
    expect(isFiniteNumber({})).toBe(false);
    expect(isFiniteNumber([])).toBe(false);
  });
});
