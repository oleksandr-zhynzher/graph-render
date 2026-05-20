import { describe, expect, it } from 'vitest';

import {
  LABEL_PILL_CHAR_WIDTH,
  LABEL_PILL_FONT_SIZE,
  LABEL_PILL_FONT_WEIGHT,
  LABEL_PILL_HEIGHT,
  LABEL_PILL_MAX_CHARS,
  LABEL_PILL_MIN_WIDTH,
  LABEL_PILL_PADDING_X,
  LABEL_PILL_RADIUS,
} from '../labels';

describe('labels constants', () => {
  it('LABEL_PILL_MIN_WIDTH is positive', () => {
    expect(LABEL_PILL_MIN_WIDTH).toBeGreaterThan(0);
  });

  it('LABEL_PILL_HEIGHT is positive', () => {
    expect(LABEL_PILL_HEIGHT).toBeGreaterThan(0);
  });

  it('LABEL_PILL_RADIUS is non-negative', () => {
    expect(LABEL_PILL_RADIUS).toBeGreaterThanOrEqual(0);
  });

  it('LABEL_PILL_PADDING_X is positive', () => {
    expect(LABEL_PILL_PADDING_X).toBeGreaterThan(0);
  });

  it('LABEL_PILL_CHAR_WIDTH is positive', () => {
    expect(LABEL_PILL_CHAR_WIDTH).toBeGreaterThan(0);
  });

  it('LABEL_PILL_MAX_CHARS is positive', () => {
    expect(LABEL_PILL_MAX_CHARS).toBeGreaterThan(0);
  });

  it('LABEL_PILL_FONT_SIZE is positive', () => {
    expect(LABEL_PILL_FONT_SIZE).toBeGreaterThan(0);
  });

  it('LABEL_PILL_FONT_WEIGHT is positive', () => {
    expect(LABEL_PILL_FONT_WEIGHT).toBeGreaterThan(0);
  });

  it('LABEL_PILL_MIN_WIDTH is at least 2 * LABEL_PILL_PADDING_X', () => {
    expect(LABEL_PILL_MIN_WIDTH).toBeGreaterThanOrEqual(LABEL_PILL_PADDING_X * 2);
  });

  it('LABEL_PILL_MAX_CHARS is a reasonable cap (e.g. between 10 and 200)', () => {
    expect(LABEL_PILL_MAX_CHARS).toBeGreaterThanOrEqual(10);
    expect(LABEL_PILL_MAX_CHARS).toBeLessThanOrEqual(200);
  });
});
