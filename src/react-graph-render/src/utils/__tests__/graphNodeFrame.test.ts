import { describe, expect, it } from 'vitest';

import { getGraphNodeFrameState } from '../graphNodeFrame';

const defaultOptions = {
  isSelected: false,
  isHighlighted: false,
  highlightColor: '#ff0',
  selectionColor: '#f59e0b',
  nodeBorderColor: undefined,
  nodeBorderWidth: 0,
  hoverNodeBorderColor: '#999',
  hoverNodeBothColor: '#800',
  hoverNodeInColor: '#2ecc71',
  hoverNodeOutColor: '#ff5b5b',
  hoverNodeHighlight: true,
  isHoveredIn: false,
  isHoveredOut: false,
};

describe('getGraphNodeFrameState', () => {
  it('returns no border when no border color and not selected', () => {
    const state = getGraphNodeFrameState(defaultOptions);
    expect(state.borderStroke).toBe('none');
    expect(state.borderOpacity).toBe(0);
    expect(state.borderWidth).toBe(0);
  });

  it('uses selectionColor when selected', () => {
    const state = getGraphNodeFrameState({ ...defaultOptions, isSelected: true });
    expect(state.borderStroke).toBe('#f59e0b');
    expect(state.borderOpacity).toBe(1);
    expect(state.borderWidth).toBeGreaterThanOrEqual(2);
  });

  it('uses highlightColor when highlighted', () => {
    const state = getGraphNodeFrameState({ ...defaultOptions, isHighlighted: true });
    expect(state.borderStroke).toBe('#ff0');
    expect(state.borderOpacity).toBe(1);
  });

  it('prioritizes selection over highlight', () => {
    const state = getGraphNodeFrameState({
      ...defaultOptions,
      isSelected: true,
      isHighlighted: true,
    });
    expect(state.borderStroke).toBe('#f59e0b');
  });

  it('uses hoverNodeBothColor when both in and out hovered', () => {
    const state = getGraphNodeFrameState({
      ...defaultOptions,
      nodeBorderColor: '#333',
      nodeBorderWidth: 1,
      isHoveredIn: true,
      isHoveredOut: true,
    });
    expect(state.borderStroke).toBe('#800');
    expect(state.isHoveredBoth).toBe(true);
  });

  it('uses hoverNodeOutColor when only out hovered', () => {
    const state = getGraphNodeFrameState({
      ...defaultOptions,
      nodeBorderColor: '#333',
      nodeBorderWidth: 1,
      isHoveredIn: false,
      isHoveredOut: true,
    });
    expect(state.borderStroke).toBe('#ff5b5b');
  });

  it('uses hoverNodeInColor when only in hovered', () => {
    const state = getGraphNodeFrameState({
      ...defaultOptions,
      nodeBorderColor: '#333',
      nodeBorderWidth: 1,
      isHoveredIn: true,
      isHoveredOut: false,
    });
    expect(state.borderStroke).toBe('#2ecc71');
  });

  it('has full opacity when selected or highlighted', () => {
    const selected = getGraphNodeFrameState({ ...defaultOptions, isSelected: true });
    const highlighted = getGraphNodeFrameState({ ...defaultOptions, isHighlighted: true });
    expect(selected.borderOpacity).toBe(1);
    expect(highlighted.borderOpacity).toBe(1);
  });

  it('isHoveredBoth and isHoveredNode are computed correctly', () => {
    const both = getGraphNodeFrameState({
      ...defaultOptions,
      isHoveredIn: true,
      isHoveredOut: true,
    });
    expect(both.isHoveredBoth).toBe(true);
    expect(both.isHoveredNode).toBe(true);

    const neither = getGraphNodeFrameState({
      ...defaultOptions,
      isHoveredIn: false,
      isHoveredOut: false,
    });
    expect(neither.isHoveredBoth).toBe(false);
    expect(neither.isHoveredNode).toBe(false);
  });

  it('borderWidth enforces min of 2 when selected', () => {
    const state = getGraphNodeFrameState({
      ...defaultOptions,
      isSelected: true,
      nodeBorderWidth: 0,
    });
    expect(state.borderWidth).toBeGreaterThanOrEqual(2);
  });

  it('borderWidth is the configured value when has border and not selected/highlighted', () => {
    const state = getGraphNodeFrameState({
      ...defaultOptions,
      nodeBorderColor: '#333',
      nodeBorderWidth: 3,
    });
    expect(state.borderWidth).toBe(3);
  });
});
