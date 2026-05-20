import { describe, expect, it } from 'vitest';

import {
  CONTROL_BUTTON_GAP,
  CONTROL_BUTTON_SIZE,
  CONTROL_DEFS,
  CONTROL_LABEL_BUTTON_WIDTH,
  CONTROL_X_POSITIONS,
  DEFAULT_COLUMN_TOLERANCE,
  DEFAULT_MAX_ZOOM,
  DEFAULT_MIN_ZOOM,
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_RADIUS,
  DEFAULT_NODE_WIDTH,
  DEFAULT_SELECTION_COLOR,
  DEFAULT_VIEWPORT,
  DEFAULT_ZOOM_STEP,
  EDGE_LABEL_HEIGHT,
  EDGE_LABEL_WIDTH,
  FIT_BOUNDS_MARGIN,
} from '../graph';

describe('graph constants', () => {
  it('DEFAULT_VIEWPORT has correct defaults', () => {
    expect(DEFAULT_VIEWPORT).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('DEFAULT_MIN_ZOOM and DEFAULT_MAX_ZOOM are within a sensible range', () => {
    expect(DEFAULT_MIN_ZOOM).toBeGreaterThan(0);
    expect(DEFAULT_MAX_ZOOM).toBeGreaterThan(DEFAULT_MIN_ZOOM);
  });

  it('DEFAULT_ZOOM_STEP is positive', () => {
    expect(DEFAULT_ZOOM_STEP).toBeGreaterThan(0);
  });

  it('DEFAULT_SELECTION_COLOR is a valid hex color', () => {
    expect(DEFAULT_SELECTION_COLOR).toMatch(/^#[\da-f]{6}$/i);
  });

  it('CONTROL_BUTTON_SIZE and CONTROL_LABEL_BUTTON_WIDTH are positive', () => {
    expect(CONTROL_BUTTON_SIZE).toBeGreaterThan(0);
    expect(CONTROL_LABEL_BUTTON_WIDTH).toBeGreaterThan(0);
  });

  it('CONTROL_BUTTON_GAP is non-negative', () => {
    expect(CONTROL_BUTTON_GAP).toBeGreaterThanOrEqual(0);
  });

  it('EDGE_LABEL_WIDTH and EDGE_LABEL_HEIGHT are positive', () => {
    expect(EDGE_LABEL_WIDTH).toBeGreaterThan(0);
    expect(EDGE_LABEL_HEIGHT).toBeGreaterThan(0);
  });

  it('FIT_BOUNDS_MARGIN is non-negative', () => {
    expect(FIT_BOUNDS_MARGIN).toBeGreaterThanOrEqual(0);
  });

  it('DEFAULT_NODE_HEIGHT, DEFAULT_NODE_RADIUS, DEFAULT_NODE_WIDTH are positive', () => {
    expect(DEFAULT_NODE_HEIGHT).toBeGreaterThan(0);
    expect(DEFAULT_NODE_RADIUS).toBeGreaterThan(0);
    expect(DEFAULT_NODE_WIDTH).toBeGreaterThan(0);
  });

  it('DEFAULT_COLUMN_TOLERANCE is non-negative', () => {
    expect(DEFAULT_COLUMN_TOLERANCE).toBeGreaterThanOrEqual(0);
  });

  it('CONTROL_DEFS has 4 items with expected keys', () => {
    expect(CONTROL_DEFS).toHaveLength(4);
    for (const def of CONTROL_DEFS) {
      expect(def).toHaveProperty('key');
      expect(def).toHaveProperty('label');
      expect(def).toHaveProperty('ariaLabel');
      expect(def).toHaveProperty('width');
    }
  });

  it('CONTROL_X_POSITIONS starts at 0', () => {
    expect(CONTROL_X_POSITIONS[0]).toBe(0);
  });

  it('CONTROL_X_POSITIONS length matches CONTROL_DEFS length', () => {
    expect(CONTROL_X_POSITIONS).toHaveLength(CONTROL_DEFS.length);
  });

  it('CONTROL_X_POSITIONS are monotonically increasing', () => {
    for (let i = 1; i < CONTROL_X_POSITIONS.length; i++) {
      expect(CONTROL_X_POSITIONS[i]).toBeGreaterThan(CONTROL_X_POSITIONS[i - 1]!);
    }
  });

  it('CONTROL_X_POSITIONS second element equals first width plus gap', () => {
    expect(CONTROL_X_POSITIONS[1]).toBe(CONTROL_DEFS[0].width + CONTROL_BUTTON_GAP);
  });
});
