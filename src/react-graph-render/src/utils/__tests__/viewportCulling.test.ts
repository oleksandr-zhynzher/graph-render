import type { PositionedEdge, PositionedNode } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import {
  filterEdgesInViewport,
  filterNodesInViewport,
  getViewportWorldBounds,
} from '../viewportCulling';

describe('viewportCulling', () => {
  it('computes world bounds from viewport transform', () => {
    const bounds = getViewportWorldBounds({ x: 0, y: 0, zoom: 1 }, 800, 600, 0);
    expect(bounds.minX).toBeCloseTo(0);
    expect(bounds.minY).toBeCloseTo(0);
    expect(bounds.maxX).toBe(800);
    expect(bounds.maxY).toBe(600);
  });

  it('filters nodes outside the viewport', () => {
    const nodes: PositionedNode[] = [
      { id: 'in', position: { x: 10, y: 10 }, size: { width: 50, height: 40 } },
      { id: 'out', position: { x: 5000, y: 5000 }, size: { width: 50, height: 40 } },
    ];

    const visible = filterNodesInViewport(nodes, { x: 0, y: 0, zoom: 1 }, 200, 200);
    expect(visible.map((node) => node.id)).toEqual(['in']);
  });

  it('uses default render size for nodes without measured size', () => {
    const nodes: PositionedNode[] = [{ id: 'partially-visible', position: { x: 190, y: 190 } }];

    const visible = filterNodesInViewport(nodes, { x: 0, y: 0, zoom: 1 }, 200, 200, 0);

    expect(visible.map((node) => node.id)).toEqual(['partially-visible']);
  });

  it('keeps edges with either endpoint visible', () => {
    const edges: PositionedEdge[] = [
      { id: 'edge', source: 'in', target: 'out', points: [] },
      { id: 'hidden', source: 'out-a', target: 'out-b', points: [] },
    ];

    const visible = filterEdgesInViewport(
      edges,
      new Set(['in']),
      { x: 0, y: 0, zoom: 1 },
      200,
      200,
      0
    );

    expect(visible.map((edge) => edge.id)).toEqual(['edge']);
  });

  it('keeps edges whose routed segment crosses the viewport with offscreen endpoints', () => {
    const edges: PositionedEdge[] = [
      {
        id: 'crossing',
        source: 'left',
        target: 'right',
        points: [
          { x: -100, y: 100 },
          { x: 300, y: 100 },
        ],
      },
      {
        id: 'outside',
        source: 'top',
        target: 'far',
        points: [
          { x: -100, y: -100 },
          { x: -50, y: -50 },
        ],
      },
    ];

    const visible = filterEdgesInViewport(edges, new Set(), { x: 0, y: 0, zoom: 1 }, 200, 200, 0);

    expect(visible.map((edge) => edge.id)).toEqual(['crossing']);
  });
});
