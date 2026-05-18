import {
  EdgeType,
  LayoutDirection,
  LayoutType,
  NodeSizingMode,
  RoutingStyle,
} from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { DEFAULT_CONFIG } from '../defaults';

describe('DEFAULT_CONFIG', () => {
  it('has correct width and height defaults', () => {
    expect(DEFAULT_CONFIG.width).toBe(960);
    expect(DEFAULT_CONFIG.height).toBe(720);
  });

  it('uses Directed as default edge type', () => {
    expect(DEFAULT_CONFIG.defaultEdgeType).toBe(EdgeType.Directed);
  });

  it('enables curved edges by default', () => {
    expect(DEFAULT_CONFIG.curveEdges).toBe(true);
  });

  it('has a positive curveStrength', () => {
    expect(DEFAULT_CONFIG.curveStrength).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.curveStrength).toBeLessThanOrEqual(1);
  });

  it('has a positive arrowPadding', () => {
    expect(DEFAULT_CONFIG.arrowPadding).toBeGreaterThan(0);
  });

  it('uses Smart routing style by default', () => {
    expect(DEFAULT_CONFIG.routingStyle).toBe(RoutingStyle.Smart);
  });

  it('has a positive edgeSeparation', () => {
    expect(DEFAULT_CONFIG.edgeSeparation).toBeGreaterThan(0);
  });

  it('has a positive selfLoopRadius', () => {
    expect(DEFAULT_CONFIG.selfLoopRadius).toBeGreaterThan(0);
  });

  it('uses Centered layout by default', () => {
    expect(DEFAULT_CONFIG.layout).toBe(LayoutType.Centered);
  });

  it('uses LTR layout direction by default', () => {
    expect(DEFAULT_CONFIG.layoutDirection).toBe(LayoutDirection.LTR);
  });

  it('has autoLabels disabled by default', () => {
    expect(DEFAULT_CONFIG.autoLabels).toBe(false);
  });

  it('has a positive labelOffset', () => {
    expect(DEFAULT_CONFIG.labelOffset).toBeGreaterThan(0);
  });

  it('uses Fixed node sizing mode by default', () => {
    expect(DEFAULT_CONFIG.nodeSizing).toBe(NodeSizingMode.Fixed);
  });

  it('has valid label measurement defaults', () => {
    expect(DEFAULT_CONFIG.labelMeasurementPaddingX).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.labelMeasurementPaddingY).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.labelMeasurementCharWidth).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.labelMeasurementLineHeight).toBeGreaterThan(0);
  });

  it('has hoverHighlight enabled by default', () => {
    expect(DEFAULT_CONFIG.hoverHighlight).toBe(true);
  });

  it('has hoverEdgeColor as a valid color string', () => {
    expect(typeof DEFAULT_CONFIG.hoverEdgeColor).toBe('string');
    expect(DEFAULT_CONFIG.hoverEdgeColor!.startsWith('#')).toBe(true);
  });

  it('has hoverNodeInColor and hoverNodeOutColor as valid color strings', () => {
    expect(DEFAULT_CONFIG.hoverNodeInColor!.startsWith('#')).toBe(true);
    expect(DEFAULT_CONFIG.hoverNodeOutColor!.startsWith('#')).toBe(true);
  });

  it('has hoverNodeHighlight enabled by default', () => {
    expect(DEFAULT_CONFIG.hoverNodeHighlight).toBe(true);
  });

  it('has edgeLabelColor as a valid color string', () => {
    expect(DEFAULT_CONFIG.edgeLabelColor!.startsWith('#')).toBe(true);
  });
});
