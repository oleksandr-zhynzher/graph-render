import { LayoutDirection, LayoutType } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import {
  LABEL_PILL_MAX_CHARS,
  LABEL_PILL_MIN_WIDTH,
  LABEL_PILL_PADDING_X,
} from '../../constants/labels';
import { getEffectiveGraphLabels, getLabelPillWidth } from '../graphLabels';

const makeNode = (id: string, x: number, y: number, width = 180) =>
  ({ id, position: { x, y }, size: { width, height: 72 } }) as any;

describe('getLabelPillWidth', () => {
  it('returns at least LABEL_PILL_MIN_WIDTH for an empty string', () => {
    expect(getLabelPillWidth('')).toBeGreaterThanOrEqual(LABEL_PILL_MIN_WIDTH);
  });

  it('returns at least LABEL_PILL_MIN_WIDTH for a short label', () => {
    expect(getLabelPillWidth('Hi')).toBeGreaterThanOrEqual(LABEL_PILL_MIN_WIDTH);
  });

  it('grows with label length', () => {
    const short = getLabelPillWidth('AB');
    const long = getLabelPillWidth('ABCDEFGHIJ');
    expect(long).toBeGreaterThan(short);
  });

  it('caps width at LABEL_PILL_MAX_CHARS characters', () => {
    const longLabel = 'A'.repeat(LABEL_PILL_MAX_CHARS + 10);
    const capped = getLabelPillWidth(longLabel);
    const maxLabel = 'A'.repeat(LABEL_PILL_MAX_CHARS);
    const maxWidth = getLabelPillWidth(maxLabel);
    expect(capped).toBe(maxWidth);
  });

  it('accounts for padding on both sides', () => {
    // A single char label: charWidth*1 + 2*padding; must exceed MIN_WIDTH or be MIN
    const width = getLabelPillWidth('X');
    expect(width).toBeGreaterThanOrEqual(LABEL_PILL_PADDING_X * 2);
  });
});

describe('getEffectiveGraphLabels', () => {
  it('returns empty arrays for empty node list', () => {
    const result = getEffectiveGraphLabels([], LayoutType.Tree, LayoutDirection.LTR);
    expect(result.orderedXs).toHaveLength(0);
    expect(result.orderedLabels).toHaveLength(0);
  });

  it('returns explicit labels aligned with columns', () => {
    const nodes = [makeNode('a', 0, 0), makeNode('b', 600, 0)];
    const labels = ['Col A', 'Col B'];
    const result = getEffectiveGraphLabels(nodes, LayoutType.Tree, LayoutDirection.LTR, labels);
    expect(result.orderedLabels).toEqual(labels);
    expect(result.orderedXs).toHaveLength(2);
  });

  it('generates inferred labels when autoLabels is true', () => {
    const nodes = [makeNode('a', 0, 0)];
    const result = getEffectiveGraphLabels(
      nodes,
      LayoutType.Tree,
      LayoutDirection.LTR,
      undefined,
      true
    );
    expect(result.orderedLabels).toHaveLength(1);
    expect(result.orderedLabels[0]).toBe('Final'); // 1 node → 1*2=2 → 'Final'
  });

  it('reverses order for RTL tree layout', () => {
    const nodes = [makeNode('a', 0, 0), makeNode('b', 600, 0)];
    const labels = ['First', 'Second'];
    const ltr = getEffectiveGraphLabels(nodes, LayoutType.Tree, LayoutDirection.LTR, labels);
    const rtl = getEffectiveGraphLabels(nodes, LayoutType.Tree, LayoutDirection.RTL, labels);
    expect(rtl.orderedLabels).toEqual([...ltr.orderedLabels].reverse());
    expect(rtl.orderedXs).toEqual([...ltr.orderedXs].reverse());
  });

  it('does not reverse for non-tree layouts', () => {
    const nodes = [makeNode('a', 0, 0), makeNode('b', 600, 0)];
    const labels = ['A', 'B'];
    const result = getEffectiveGraphLabels(nodes, LayoutType.Centered, LayoutDirection.RTL, labels);
    expect(result.orderedLabels).toEqual(labels);
  });

  it('returns empty labels when no labels and autoLabels is false', () => {
    const nodes = [makeNode('a', 0, 0)];
    const result = getEffectiveGraphLabels(
      nodes,
      LayoutType.Tree,
      LayoutDirection.LTR,
      undefined,
      false
    );
    expect(result.orderedLabels).toHaveLength(0);
  });
});
