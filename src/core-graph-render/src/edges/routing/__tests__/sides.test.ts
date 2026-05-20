import type { EdgeRoutingContext } from '@graph-render/types';
import { LayoutDirection, NodeSide, RoutingStyle } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { findConnectionSides } from '../sides';

const makeNode = (id: string, x: number, y: number) => ({ id, position: { x, y } });
const makeSize = (w: number, h: number) => ({ width: w, height: h });

const makeContext = (overrides: Partial<EdgeRoutingContext> = {}): EdgeRoutingContext => ({
  source: makeNode('a', 0, 0),
  target: makeNode('b', 200, 0),
  sourceSize: makeSize(100, 50),
  targetSize: makeSize(100, 50),
  isUndirected: false,
  arrowPadding: 6,
  straight: false,
  forceRightToLeft: false,
  layoutDirection: LayoutDirection.LTR,
  routingStyle: RoutingStyle.Smart,
  edgeSeparation: 18,
  selfLoopRadius: 32,
  otherRects: [],
  ...overrides,
});

const SIZE = makeSize(100, 50);

describe('findConnectionSides', () => {
  it('returns Right for source and Left for target when forceRightToLeft=true', () => {
    const source = makeNode('a', 0, 0);
    const target = makeNode('b', 200, 0);
    const ctx = makeContext({ forceRightToLeft: true });
    const result = findConnectionSides(source, target, SIZE, SIZE, ctx, true);
    expect(result.sourceSide).toBe(NodeSide.Right);
    expect(result.targetSide).toBe(NodeSide.Left);
  });

  it('returns Right sourceSide for a target to the right', () => {
    const source = makeNode('a', 0, 0);
    const target = makeNode('b', 200, 0);
    const ctx = makeContext();
    const result = findConnectionSides(source, target, SIZE, SIZE, ctx, true);
    expect(result.sourceSide).toBe(NodeSide.Right);
  });

  it('returns Left sourceSide for a target to the left', () => {
    const source = makeNode('a', 200, 0);
    const target = makeNode('b', 0, 0);
    const ctx = makeContext();
    // isDirected=false so no LTR preference overrides geometry
    const result = findConnectionSides(source, target, SIZE, SIZE, ctx, false);
    expect(result.sourceSide).toBe(NodeSide.Left);
  });

  it('returns Bottom sourceSide for a target below', () => {
    const source = makeNode('a', 0, 0);
    const target = makeNode('b', 0, 200);
    const ctx = makeContext();
    // isDirected=false so no LTR preference overrides geometry
    const result = findConnectionSides(source, target, SIZE, SIZE, ctx, false);
    expect(result.sourceSide).toBe(NodeSide.Bottom);
  });

  it('returns Top sourceSide for a target above', () => {
    const source = makeNode('a', 0, 200);
    const target = makeNode('b', 0, 0);
    const ctx = makeContext();
    // isDirected=false so no LTR preference overrides geometry
    const result = findConnectionSides(source, target, SIZE, SIZE, ctx, false);
    expect(result.sourceSide).toBe(NodeSide.Top);
  });

  it('always returns sourceSide and targetSide properties', () => {
    const source = makeNode('a', 0, 0);
    const target = makeNode('b', 100, 100);
    const ctx = makeContext();
    const result = findConnectionSides(source, target, SIZE, SIZE, ctx, false);
    expect(result).toHaveProperty('sourceSide');
    expect(result).toHaveProperty('targetSide');
  });
});
