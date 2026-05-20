import { RoutingStyle } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { buildEdgeRoutingOptions, buildGraphLayoutOptions } from '../graphModelOptions';

const makeConfig = (overrides: Record<string, unknown> = {}) =>
  ({
    padding: 40,
    layout: 'centered',
    width: 960,
    height: 720,
    layoutDirection: 'ltr',
    nodeSizing: 'fixed',
    fixedNodeSize: undefined,
    labelMeasurementPaddingX: 18,
    labelMeasurementPaddingY: 12,
    labelMeasurementCharWidth: 8,
    labelMeasurementLineHeight: 18,
    arrowPadding: 6,
    curveEdges: true,
    routingStyle: RoutingStyle.Smart,
    edgeSeparation: 18,
    selfLoopRadius: 32,
    forceRightToLeft: false,
    ...overrides,
  }) as any;

const makeTheme = () => ({}) as any;

describe('buildGraphLayoutOptions', () => {
  it('maps config fields to LayoutOptions shape', () => {
    const config = makeConfig();
    const result = buildGraphLayoutOptions({
      config,
      edges: [],
      mergedTheme: makeTheme(),
      nodes: [],
    });

    expect(result.padding).toBe(config.padding);
    expect(result.layout).toBe(config.layout);
    expect(result.width).toBe(config.width);
    expect(result.height).toBe(config.height);
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });

  it('passes node and edge arrays through', () => {
    const nodes = [{ id: 'n1' }] as any;
    const edges = [{ id: 'e1' }] as any;
    const result = buildGraphLayoutOptions({
      config: makeConfig(),
      edges,
      mergedTheme: makeTheme(),
      nodes,
    });
    expect(result.nodes).toBe(nodes);
    expect(result.edges).toBe(edges);
  });
});

describe('buildEdgeRoutingOptions', () => {
  it('sets straight to true when curveEdges is false', () => {
    const config = makeConfig({ curveEdges: false });
    const result = buildEdgeRoutingOptions(config);
    expect(result.straight).toBe(true);
  });

  it('sets straight to false when curveEdges is true and routingStyle is Smart', () => {
    const config = makeConfig({ curveEdges: true, routingStyle: RoutingStyle.Smart });
    const result = buildEdgeRoutingOptions(config);
    expect(result.straight).toBe(false);
  });

  it('sets straight to true when routingStyle is Orthogonal', () => {
    const config = makeConfig({ curveEdges: true, routingStyle: RoutingStyle.Orthogonal });
    const result = buildEdgeRoutingOptions(config);
    expect(result.straight).toBe(true);
  });

  it('passes arrowPadding through', () => {
    const config = makeConfig({ arrowPadding: 12 });
    const result = buildEdgeRoutingOptions(config);
    expect(result.arrowPadding).toBe(12);
  });

  it('passes routingStyle through', () => {
    const config = makeConfig({ routingStyle: RoutingStyle.Orthogonal });
    const result = buildEdgeRoutingOptions(config);
    expect(result.routingStyle).toBe(RoutingStyle.Orthogonal);
  });
});
