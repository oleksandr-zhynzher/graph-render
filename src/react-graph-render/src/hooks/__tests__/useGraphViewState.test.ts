import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useGraphViewState } from '../useGraphViewState';

const makeOptions = (overrides = {}) => ({
  safeMinZoom: 0.25,
  safeMaxZoom: 2.5,
  controlledViewport: undefined,
  defaultViewport: undefined,
  onViewportChange: undefined,
  selectedNodeIds: undefined,
  selectedEdgeIds: undefined,
  defaultSelectedNodeIds: undefined,
  defaultSelectedEdgeIds: undefined,
  onSelectionChange: undefined,
  controlledFocusedNodeId: undefined,
  defaultFocusedNodeId: null,
  onFocusedNodeChange: undefined,
  ...overrides,
});

describe('useGraphViewState', () => {
  describe('viewport', () => {
    it('initializes with DEFAULT_VIEWPORT when no defaultViewport', () => {
      const { result } = renderHook(() => useGraphViewState(makeOptions()));
      expect(result.current.viewport).toMatchObject({ x: 0, y: 0, zoom: 1 });
    });

    it('initializes from defaultViewport', () => {
      const { result } = renderHook(() =>
        useGraphViewState(makeOptions({ defaultViewport: { x: 10, y: 20, zoom: 1.5 } }))
      );
      expect(result.current.viewport.x).toBe(10);
      expect(result.current.viewport.y).toBe(20);
      expect(result.current.viewport.zoom).toBeCloseTo(1.5);
    });

    it('clamps zoom to safeMinZoom', () => {
      const { result } = renderHook(() =>
        useGraphViewState(makeOptions({ defaultViewport: { x: 0, y: 0, zoom: 0.01 } }))
      );
      expect(result.current.viewport.zoom).toBeGreaterThanOrEqual(0.25);
    });

    it('clamps zoom to safeMaxZoom', () => {
      const { result } = renderHook(() =>
        useGraphViewState(makeOptions({ defaultViewport: { x: 0, y: 0, zoom: 99 } }))
      );
      expect(result.current.viewport.zoom).toBeLessThanOrEqual(2.5);
    });

    it('updateViewport updates uncontrolled viewport', () => {
      const { result } = renderHook(() => useGraphViewState(makeOptions()));
      act(() => {
        result.current.updateViewport({ x: 100, y: 200, zoom: 1.2 });
      });
      expect(result.current.viewport.x).toBe(100);
      expect(result.current.viewport.y).toBe(200);
    });

    it('calls onViewportChange when viewport is updated', () => {
      const onViewportChange = vi.fn();
      const { result } = renderHook(() => useGraphViewState(makeOptions({ onViewportChange })));
      act(() => {
        result.current.updateViewport({ x: 5, y: 5, zoom: 1 });
      });
      expect(onViewportChange).toHaveBeenCalled();
    });

    it('supports functional update form', () => {
      const { result } = renderHook(() => useGraphViewState(makeOptions()));
      act(() => {
        result.current.updateViewport((current) => ({ ...current, zoom: current.zoom + 0.1 }));
      });
      expect(result.current.viewport.zoom).toBeCloseTo(1.1);
    });

    it('uses controlledViewport when provided', () => {
      const { result } = renderHook(() =>
        useGraphViewState(makeOptions({ controlledViewport: { x: 50, y: 60, zoom: 2 } }))
      );
      expect(result.current.viewport.x).toBe(50);
      expect(result.current.viewport.zoom).toBe(2);
    });
  });

  describe('selection', () => {
    it('initializes with empty selection by default', () => {
      const { result } = renderHook(() => useGraphViewState(makeOptions()));
      expect(result.current.selection).toEqual({ nodeIds: [], edgeIds: [] });
    });

    it('initializes from defaultSelectedNodeIds', () => {
      const { result } = renderHook(() =>
        useGraphViewState(makeOptions({ defaultSelectedNodeIds: ['n1'] }))
      );
      expect(result.current.selection.nodeIds).toContain('n1');
    });

    it('updateSelection updates selection', () => {
      const { result } = renderHook(() => useGraphViewState(makeOptions()));
      act(() => {
        result.current.updateSelection({ nodeIds: ['n1'], edgeIds: [] });
      });
      expect(result.current.selection.nodeIds).toContain('n1');
    });

    it('calls onSelectionChange when updated', () => {
      const onSelectionChange = vi.fn();
      const { result } = renderHook(() => useGraphViewState(makeOptions({ onSelectionChange })));
      act(() => {
        result.current.updateSelection({ nodeIds: ['n1'], edgeIds: ['e1'] });
      });
      expect(onSelectionChange).toHaveBeenCalledWith({ nodeIds: ['n1'], edgeIds: ['e1'] });
    });
  });

  describe('focusedNodeId', () => {
    it('defaults to null or undefined when no defaultFocusedNodeId', () => {
      const { result } = renderHook(() => useGraphViewState(makeOptions()));
      expect(result.current.focusedNodeId == null).toBe(true);
    });

    it('initializes from defaultFocusedNodeId', () => {
      const { result } = renderHook(() =>
        useGraphViewState(makeOptions({ defaultFocusedNodeId: 'n1' }))
      );
      expect(result.current.focusedNodeId).toBe('n1');
    });

    it('updateFocusedNode updates internal state', () => {
      const { result } = renderHook(() => useGraphViewState(makeOptions()));
      act(() => {
        result.current.updateFocusedNode('n2');
      });
      expect(result.current.focusedNodeId).toBe('n2');
    });

    it('uses controlledFocusedNodeId when provided', () => {
      const { result } = renderHook(() =>
        useGraphViewState(makeOptions({ controlledFocusedNodeId: 'controlled' }))
      );
      expect(result.current.focusedNodeId).toBe('controlled');
    });
  });
});
