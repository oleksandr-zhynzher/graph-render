import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useGraphCollapseHandlers } from '../useGraphCollapseHandlers';

const makeNode = (id: string) =>
  ({ id, position: { x: 0, y: 0 }, size: { width: 100, height: 50 } }) as any;
const makeGraph = () => ({ nodes: [], edges: [] }) as any;

const makeOptions = (overrides = {}) => ({
  childNodeIdsByParent: new Map<string, string[]>(),
  collapsedNodeSet: new Set<string>(),
  graph: makeGraph(),
  onError: undefined,
  onNodeCollapse: undefined,
  onNodeExpand: undefined,
  pendingExpansionNodeSet: new Set<string>(),
  setPendingExpansionNodeIds: vi.fn(),
  toggleCollapseOnNodeDoubleClick: true,
  updateCollapsedNodeIds: vi.fn(),
  ...overrides,
});

describe('useGraphCollapseHandlers', () => {
  it('does nothing when toggleCollapseOnNodeDoubleClick is false', () => {
    const updateCollapsedNodeIds = vi.fn();
    const { result } = renderHook(() =>
      useGraphCollapseHandlers(
        makeOptions({ toggleCollapseOnNodeDoubleClick: false, updateCollapsedNodeIds })
      )
    );
    act(() => result.current(makeNode('n1')));
    expect(updateCollapsedNodeIds).not.toHaveBeenCalled();
  });

  it('does nothing for nodes without children', () => {
    const updateCollapsedNodeIds = vi.fn();
    const { result } = renderHook(() =>
      useGraphCollapseHandlers(makeOptions({ updateCollapsedNodeIds }))
    );
    act(() => result.current(makeNode('n1')));
    expect(updateCollapsedNodeIds).not.toHaveBeenCalled();
  });

  it('collapses node with children', () => {
    const updateCollapsedNodeIds = vi.fn();
    const childNodeIdsByParent = new Map([['parent', ['child']]]);
    const { result } = renderHook(() =>
      useGraphCollapseHandlers(makeOptions({ updateCollapsedNodeIds, childNodeIdsByParent }))
    );
    act(() => result.current(makeNode('parent')));
    expect(updateCollapsedNodeIds).toHaveBeenCalled();
  });

  it('calls onNodeCollapse when collapsing', () => {
    const onNodeCollapse = vi.fn();
    const childNodeIdsByParent = new Map([['parent', ['child']]]);
    const { result } = renderHook(() =>
      useGraphCollapseHandlers(makeOptions({ onNodeCollapse, childNodeIdsByParent }))
    );
    act(() => result.current(makeNode('parent')));
    expect(onNodeCollapse).toHaveBeenCalledWith('parent');
  });

  it('expands already-collapsed node with children', () => {
    const updateCollapsedNodeIds = vi.fn();
    const onNodeExpand = vi.fn();
    const childNodeIdsByParent = new Map([['parent', ['child']]]);
    const collapsedNodeSet = new Set(['parent']);
    const { result } = renderHook(() =>
      useGraphCollapseHandlers(
        makeOptions({
          updateCollapsedNodeIds,
          onNodeExpand,
          childNodeIdsByParent,
          collapsedNodeSet,
        })
      )
    );
    act(() => result.current(makeNode('parent')));
    expect(onNodeExpand).toHaveBeenCalledWith('parent');
    expect(updateCollapsedNodeIds).toHaveBeenCalled();
  });

  it('does nothing for nodes in pendingExpansionNodeSet', () => {
    const updateCollapsedNodeIds = vi.fn();
    const childNodeIdsByParent = new Map([['parent', ['child']]]);
    const pendingExpansionNodeSet = new Set(['parent']);
    const { result } = renderHook(() =>
      useGraphCollapseHandlers(
        makeOptions({ updateCollapsedNodeIds, childNodeIdsByParent, pendingExpansionNodeSet })
      )
    );
    act(() => result.current(makeNode('parent')));
    expect(updateCollapsedNodeIds).not.toHaveBeenCalled();
  });

  it('handles onNodeCollapse throwing by calling onError', () => {
    const onError = vi.fn();
    const onNodeCollapse = vi.fn().mockImplementation(() => {
      throw new Error('collapse error');
    });
    const childNodeIdsByParent = new Map([['parent', ['child']]]);
    const { result } = renderHook(() =>
      useGraphCollapseHandlers(makeOptions({ onError, onNodeCollapse, childNodeIdsByParent }))
    );
    act(() => result.current(makeNode('parent')));
    expect(onError).toHaveBeenCalled();
  });

  it('handles async onNodeExpand and adds node to pending', async () => {
    const setPendingExpansionNodeIds = vi.fn();
    const updateCollapsedNodeIds = vi.fn();
    const onNodeExpand = vi.fn().mockResolvedValue(undefined);
    const childNodeIdsByParent = new Map([['parent', ['child']]]);
    const collapsedNodeSet = new Set(['parent']);
    const { result } = renderHook(() =>
      useGraphCollapseHandlers(
        makeOptions({
          setPendingExpansionNodeIds,
          updateCollapsedNodeIds,
          onNodeExpand,
          childNodeIdsByParent,
          collapsedNodeSet,
        })
      )
    );
    act(() => result.current(makeNode('parent')));
    expect(setPendingExpansionNodeIds).toHaveBeenCalled();
    // Wait for the promise to settle
    await act(async () => {
      await Promise.resolve();
    });
    expect(updateCollapsedNodeIds).toHaveBeenCalled();
  });
});
