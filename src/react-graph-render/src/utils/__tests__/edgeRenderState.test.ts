import { EdgeType } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { getEdgeRenderState } from '../edgeRenderState';

const makeEdge = (id: string, source: string, target: string, type = EdgeType.Directed) =>
  ({ id, source, target, type }) as any;

describe('getEdgeRenderState', () => {
  const edge = makeEdge('e1', 'n1', 'n2');

  it('not hovered when nothing is hovered', () => {
    const state = getEdgeRenderState(edge, {
      hoverHighlight: true,
      hoveredEdgeId: null,
      hoveredNodeId: null,
    });
    expect(state.edgeHovered).toBe(false);
    expect(state.isIncomingToHovered).toBe(false);
  });

  it('edgeHovered true when hoveredEdgeId matches', () => {
    const state = getEdgeRenderState(edge, {
      hoverHighlight: true,
      hoveredEdgeId: 'e1',
      hoveredNodeId: null,
    });
    expect(state.edgeHovered).toBe(true);
  });

  it('edgeHovered false when hoverHighlight is disabled', () => {
    const state = getEdgeRenderState(edge, {
      hoverHighlight: false,
      hoveredEdgeId: 'e1',
      hoveredNodeId: null,
    });
    expect(state.edgeHovered).toBe(false);
  });

  it('edgeHovered true when source node is hovered', () => {
    const state = getEdgeRenderState(edge, {
      hoverHighlight: true,
      hoveredEdgeId: null,
      hoveredNodeId: 'n1',
    });
    expect(state.edgeHovered).toBe(true);
  });

  it('edgeHovered true when target node is hovered', () => {
    const state = getEdgeRenderState(edge, {
      hoverHighlight: true,
      hoveredEdgeId: null,
      hoveredNodeId: 'n2',
    });
    expect(state.edgeHovered).toBe(true);
  });

  it('edgeHovered false for unrelated hovered node', () => {
    const state = getEdgeRenderState(edge, {
      hoverHighlight: true,
      hoveredEdgeId: null,
      hoveredNodeId: 'n99',
    });
    expect(state.edgeHovered).toBe(false);
  });

  it('edgeHovered true when in pathHighlightEdges', () => {
    const state = getEdgeRenderState(edge, {
      hoverHighlight: false,
      hoveredEdgeId: null,
      hoveredNodeId: null,
      pathHighlightEdges: new Set(['e1']),
    });
    expect(state.edgeHovered).toBe(true);
  });

  it('isIncomingToHovered true for directed edge pointing to hovered node', () => {
    const state = getEdgeRenderState(edge, {
      hoverHighlight: true,
      hoveredEdgeId: null,
      hoveredNodeId: 'n2',
    });
    expect(state.isIncomingToHovered).toBe(true);
  });

  it('isIncomingToHovered false when a specific edge is hovered instead of node', () => {
    const state = getEdgeRenderState(edge, {
      hoverHighlight: true,
      hoveredEdgeId: 'e1',
      hoveredNodeId: 'n2',
    });
    expect(state.isIncomingToHovered).toBe(false);
  });

  it('isIncomingToHovered false for undirected edge', () => {
    const undirected = makeEdge('e2', 'n1', 'n2', EdgeType.Undirected);
    const state = getEdgeRenderState(undirected, {
      hoverHighlight: true,
      hoveredEdgeId: null,
      hoveredNodeId: 'n2',
    });
    expect(state.isIncomingToHovered).toBe(false);
  });

  it('isIncomingToHovered false when target does not match hovered node', () => {
    const state = getEdgeRenderState(edge, {
      hoverHighlight: true,
      hoveredEdgeId: null,
      hoveredNodeId: 'n1',
    });
    expect(state.isIncomingToHovered).toBe(false);
  });
});
