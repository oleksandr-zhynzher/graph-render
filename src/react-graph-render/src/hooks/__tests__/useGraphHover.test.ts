import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useGraphHover } from '../useGraphHover';

const makeNode = (id: string) => ({ id, position: { x: 0, y: 0 } }) as any;
const makeEdge = (id: string, source: string, target: string) =>
  ({
    id,
    source,
    target,
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ],
  }) as any;

describe('useGraphHover', () => {
  const nodes = [makeNode('n1'), makeNode('n2')];
  const edges = [makeEdge('e1', 'n1', 'n2')];

  it('initializes with no hover state', () => {
    const { result } = renderHook(() => useGraphHover(nodes, edges, true));
    expect(result.current.hoveredEdgeId).toBeNull();
    expect(result.current.hoveredNodeId).toBeNull();
    expect(result.current.focusedPath).toBeNull();
    expect(result.current.pathHighlight).toBeNull();
  });

  it('setHoveredEdgeId updates hoveredEdgeId', () => {
    const { result } = renderHook(() => useGraphHover(nodes, edges, true));
    act(() => {
      result.current.setHoveredEdgeId('e1');
    });
    expect(result.current.hoveredEdgeId).toBe('e1');
  });

  it('setHoveredNodeId updates hoveredNodeId', () => {
    const { result } = renderHook(() => useGraphHover(nodes, edges, true));
    act(() => {
      result.current.setHoveredNodeId('n1');
    });
    expect(result.current.hoveredNodeId).toBe('n1');
  });

  it('hoveredNodeStates is null when nothing is hovered', () => {
    const { result } = renderHook(() => useGraphHover(nodes, edges, true));
    expect(result.current.hoveredNodeStates).toBeNull();
  });

  it('hoveredNodeStates is set when an edge is hovered', () => {
    const { result } = renderHook(() => useGraphHover(nodes, edges, true));
    act(() => {
      result.current.setHoveredEdgeId('e1');
    });
    expect(result.current.hoveredNodeStates).not.toBeNull();
    expect(result.current.hoveredNodeStates!.size).toBeGreaterThan(0);
  });

  it('edgesForRender puts hovered edge last (front of draw order)', () => {
    const twoEdges = [makeEdge('e1', 'n1', 'n2'), makeEdge('e2', 'n1', 'n2')];
    const { result } = renderHook(() => useGraphHover(nodes, twoEdges, true));
    act(() => {
      result.current.setHoveredEdgeId('e1');
    });
    const lastEdge = result.current.edgesForRender.at(-1);
    expect(lastEdge?.id).toBe('e1');
  });

  it('edgesForRender returns original array when nothing is highlighted', () => {
    const { result } = renderHook(() => useGraphHover(nodes, edges, true));
    expect(result.current.edgesForRender).toBe(edges);
  });

  it('setFocusedPath updates focusedPath and computes pathHighlight', () => {
    const { result } = renderHook(() => useGraphHover(nodes, edges, true));
    act(() => {
      result.current.setFocusedPath({ nodeId: 'n2', sourceIndex: null });
    });
    expect(result.current.focusedPath).toMatchObject({ nodeId: 'n2' });
    expect(result.current.pathHighlight).not.toBeNull();
    expect(result.current.pathHighlight!.nodes.has('n2')).toBe(true);
  });

  it('hoveredNodeStates is null when hoverHighlight is false', () => {
    const { result } = renderHook(() => useGraphHover(nodes, edges, false));
    act(() => {
      result.current.setHoveredEdgeId('e1');
    });
    expect(result.current.hoveredNodeStates).toBeNull();
  });
});
