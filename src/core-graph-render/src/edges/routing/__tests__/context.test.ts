import { LayoutDirection, RoutingStyle } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { createRoutingContext } from '../context';
import type { RoutingContextInput } from '../types';

const makeNode = (id: string, x = 0, y = 0) => ({ id, position: { x, y } });
const makeSize = (w: number, h: number) => ({ width: w, height: h });

const baseInput = (overrides: Partial<RoutingContextInput> = {}): RoutingContextInput => ({
  source: makeNode('a', 0, 0),
  target: makeNode('b', 200, 0),
  sourceSize: makeSize(100, 50),
  targetSize: makeSize(100, 50),
  nodes: [makeNode('a', 0, 0), makeNode('b', 200, 0)],
  useObstacleAvoidance: false,
  isUndirected: false,
  arrowPadding: 6,
  straight: false,
  forceRightToLeft: false,
  layoutDirection: LayoutDirection.LTR,
  routingStyle: RoutingStyle.Smart,
  edgeSeparation: 18,
  selfLoopRadius: 32,
  ...overrides,
});

describe('createRoutingContext', () => {
  it('returns an EdgeRoutingContext with the provided source and target', () => {
    const ctx = createRoutingContext(baseInput());
    expect(ctx.source.id).toBe('a');
    expect(ctx.target.id).toBe('b');
  });

  it('carries through forceRightToLeft=true', () => {
    const ctx = createRoutingContext(baseInput({ forceRightToLeft: true }));
    expect(ctx.forceRightToLeft).toBe(true);
  });

  it('carries through isUndirected, arrowPadding, routingStyle', () => {
    const ctx = createRoutingContext(
      baseInput({ isUndirected: true, arrowPadding: 12, routingStyle: RoutingStyle.Orthogonal })
    );
    expect(ctx.isUndirected).toBe(true);
    expect(ctx.arrowPadding).toBe(12);
    expect(ctx.routingStyle).toBe(RoutingStyle.Orthogonal);
  });

  it('otherRects is empty when useObstacleAvoidance=false', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c', 100, 100)];
    const ctx = createRoutingContext(baseInput({ nodes, useObstacleAvoidance: false }));
    expect(ctx.otherRects).toHaveLength(0);
  });

  it('otherRects excludes source and target when useObstacleAvoidance=true', () => {
    const obstacle = makeNode('c', 100, 100);
    const nodes = [makeNode('a'), makeNode('b', 200, 0), obstacle];
    const ctx = createRoutingContext(baseInput({ nodes, useObstacleAvoidance: true }));
    expect(ctx.otherRects).toHaveLength(1);
    expect(ctx.otherRects[0]!.x).toBe(100);
    expect(ctx.otherRects[0]!.y).toBe(100);
  });
});
