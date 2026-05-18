import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useGraphCollapse } from '../useGraphCollapse';

describe('useGraphCollapse', () => {
  it('initialises with empty collapsed ids when no defaults given', () => {
    const { result } = renderHook(() => useGraphCollapse({}));
    expect(result.current.collapsedIds).toEqual([]);
    expect(result.current.collapsedNodeSet.size).toBe(0);
  });

  it('initialises with defaultCollapsedNodeIds', () => {
    const { result } = renderHook(() =>
      useGraphCollapse({ defaultCollapsedNodeIds: ['n1', 'n2'] })
    );
    expect(result.current.collapsedIds).toEqual(['n1', 'n2']);
    expect(result.current.collapsedNodeSet.has('n1')).toBe(true);
  });

  it('prefers controlled collapsedNodeIds over internal state', () => {
    const { result } = renderHook(() =>
      useGraphCollapse({ collapsedNodeIds: ['n1'], defaultCollapsedNodeIds: ['n99'] })
    );
    expect(result.current.collapsedIds).toEqual(['n1']);
  });

  it('updateCollapsedNodeIds updates internal state when uncontrolled', () => {
    const { result } = renderHook(() => useGraphCollapse({}));
    act(() => {
      result.current.updateCollapsedNodeIds(['a', 'b']);
    });
    expect(result.current.collapsedIds).toEqual(['a', 'b']);
  });

  it('calls onCollapsedNodeIdsChange when updated', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useGraphCollapse({ onCollapsedNodeIdsChange: onChange }));
    act(() => {
      result.current.updateCollapsedNodeIds(['x']);
    });
    expect(onChange).toHaveBeenCalledWith(['x']);
  });

  it('functional update form reads latest ids', () => {
    const { result } = renderHook(() => useGraphCollapse({ defaultCollapsedNodeIds: ['a'] }));
    act(() => {
      result.current.updateCollapsedNodeIds((current) => [...current, 'b']);
    });
    expect(result.current.collapsedIds).toContain('a');
    expect(result.current.collapsedIds).toContain('b');
  });

  it('does not update internal state when controlled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useGraphCollapse({ collapsedNodeIds: ['n1'], onCollapsedNodeIdsChange: onChange })
    );
    act(() => {
      result.current.updateCollapsedNodeIds(['n2']);
    });
    // Internal state should not change; controlled value drives collapsedIds
    expect(result.current.collapsedIds).toEqual(['n1']);
    // But callback is still invoked
    expect(onChange).toHaveBeenCalledWith(['n2']);
  });

  it('setPendingExpansionNodeIds updates pendingExpansionNodeSet', () => {
    const { result } = renderHook(() => useGraphCollapse({}));
    act(() => {
      result.current.setPendingExpansionNodeIds(['p1']);
    });
    expect(result.current.pendingExpansionNodeSet.has('p1')).toBe(true);
  });

  it('collapsedNodeSet is updated when collapsedIds change', () => {
    const { result } = renderHook(() => useGraphCollapse({}));
    act(() => {
      result.current.updateCollapsedNodeIds(['a', 'b', 'c']);
    });
    expect(result.current.collapsedNodeSet.size).toBe(3);
    expect(result.current.collapsedNodeSet.has('c')).toBe(true);
  });
});
