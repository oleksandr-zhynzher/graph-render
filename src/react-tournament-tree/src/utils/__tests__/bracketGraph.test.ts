import { describe, expect, it } from 'vitest';

import {
  COMPACT_TOURNAMENT_CONFIG,
  DARK_COMPACT_TOURNAMENT_CONFIG,
  DARK_TOURNAMENT_CONFIG,
  DEFAULT_TOURNAMENT_CONFIG,
  NODE_DIMENSIONS,
  NODE_DIMENSIONS_COMPACT,
} from '../../constants';
import {
  buildBracketGraph,
  buildGraphConfig,
  getTranslateExtent,
  resolveBadgeText,
} from '../bracketGraph';
import type { ResolvedMatchCardStyle } from '../resolveBracketAppearance';

// Helper to build a minimal ResolvedMatchCardStyle
function matchCard(width: number, height: number): ResolvedMatchCardStyle {
  return {
    width,
    height,
    borderRadius: 14,
    insetX: 10,
    badgeSize: 24,
    badgePad: 6,
    badgeFontSize: 12,
    nameFontSize: 13,
    matchCountWidth: 20,
    matchCountTrailingGap: 8,
    scoreGroupTrailingGap: 4,
    rowPadding: '8px 10px',
    rowGap: 5,
    score: { segmentWidth: 28, segmentGap: 4, fontSize: 13, matchCountFontSize: 10 },
  };
}

const STANDARD_CARD = matchCard(NODE_DIMENSIONS.WIDTH, NODE_DIMENSIONS.HEIGHT);
const COMPACT_CARD = matchCard(NODE_DIMENSIONS_COMPACT.WIDTH, NODE_DIMENSIONS_COMPACT.HEIGHT);

// ── buildGraphConfig ──────────────────────────────────────────────────────────

describe('buildGraphConfig', () => {
  it('returns DEFAULT_TOURNAMENT_CONFIG base for light standard mode', () => {
    const result = buildGraphConfig(undefined, false, false, STANDARD_CARD);
    expect(result.theme?.background).toBe(DEFAULT_TOURNAMENT_CONFIG.theme?.background);
  });

  it('returns DARK_TOURNAMENT_CONFIG base for dark standard mode', () => {
    const result = buildGraphConfig(undefined, true, false, STANDARD_CARD);
    expect(result.theme?.background).toBe(DARK_TOURNAMENT_CONFIG.theme?.background);
  });

  it('returns COMPACT_TOURNAMENT_CONFIG base for light compact mode', () => {
    const result = buildGraphConfig(undefined, false, true, COMPACT_CARD);
    expect(result.theme?.nodeGap).toBe(COMPACT_TOURNAMENT_CONFIG.theme?.nodeGap);
  });

  it('returns DARK_COMPACT_TOURNAMENT_CONFIG base for dark compact mode', () => {
    const result = buildGraphConfig(undefined, true, true, COMPACT_CARD);
    expect(result.theme?.background).toBe(DARK_COMPACT_TOURNAMENT_CONFIG.theme?.background);
    expect(result.theme?.nodeGap).toBe(DARK_COMPACT_TOURNAMENT_CONFIG.theme?.nodeGap);
  });

  it('always sets labels to undefined and autoLabels to false', () => {
    const result = buildGraphConfig(undefined, false, false, STANDARD_CARD);
    expect(result.labels).toBeUndefined();
    expect(result.autoLabels).toBe(false);
  });

  it('uses matchCard dimensions for fixedNodeSize when none provided in config', () => {
    const result = buildGraphConfig(undefined, false, false, STANDARD_CARD);
    expect(result.fixedNodeSize).toEqual({
      width: NODE_DIMENSIONS.WIDTH,
      height: NODE_DIMENSIONS.HEIGHT,
    });
  });

  it('prefers config.fixedNodeSize over matchCard dimensions', () => {
    const config = { fixedNodeSize: { width: 99, height: 55 } };
    const result = buildGraphConfig(config, false, false, STANDARD_CARD);
    expect(result.fixedNodeSize).toEqual({ width: 99, height: 55 });
  });

  it('merges theme override from config', () => {
    const config = { theme: { background: 'red' } };
    const result = buildGraphConfig(config, false, false, STANDARD_CARD);
    expect(result.theme?.background).toBe('red');
  });

  it('spreads extra config properties onto result', () => {
    const config = { padding: 99 };
    const result = buildGraphConfig(config, false, false, STANDARD_CARD);
    expect(result.padding).toBe(99);
  });
});

// ── buildBracketGraph ─────────────────────────────────────────────────────────

describe('buildBracketGraph', () => {
  const baseGraph = {
    nodes: {
      n1: {
        id: 'n1',
        meta: {
          players: [
            { name: 'Alice', seed: 1 },
            { name: 'Bob', seed: 2 },
          ],
        },
      },
      n2: { id: 'n2', meta: {} },
    },
    adj: {},
  };

  it('injects pathKeys for nodes with player names', () => {
    const result = buildBracketGraph(baseGraph, false, STANDARD_CARD);
    expect(result.nodes?.['n1']?.meta?.['pathKeys']).toEqual(['Alice', 'Bob']);
  });

  it('does not inject pathKeys for nodes without players', () => {
    const result = buildBracketGraph(baseGraph, false, STANDARD_CARD);
    expect(result.nodes?.['n2']?.meta?.['pathKeys']).toBeUndefined();
  });

  it('sizes nodes using matchCard dimensions when no custom vertex component', () => {
    const result = buildBracketGraph(baseGraph, false, COMPACT_CARD);
    expect(result.nodes?.['n1']?.size).toEqual({
      width: NODE_DIMENSIONS_COMPACT.WIDTH,
      height: NODE_DIMENSIONS_COMPACT.HEIGHT,
    });
  });

  it('does not resize nodes when hasCustomVertexComponent is true', () => {
    const result = buildBracketGraph(baseGraph, true, COMPACT_CARD);
    expect(result.nodes?.['n1']?.size).toBeUndefined();
  });

  it('handles empty graph gracefully', () => {
    const result = buildBracketGraph({ nodes: {}, adj: {} }, false, STANDARD_CARD);
    expect(result.nodes).toEqual({});
  });
});

// ── resolveBadgeText ──────────────────────────────────────────────────────────

describe('resolveBadgeText', () => {
  const graph = { nodes: { a: {}, b: {}, c: {} }, adj: {} };
  const labels = ['Round of 16', 'Final'];

  it('returns the explicit badgeText when provided', () => {
    expect(resolveBadgeText('Custom Badge', graph, labels)).toBe('Custom Badge');
  });

  it('computes badge text from node count and final label', () => {
    expect(resolveBadgeText(undefined, graph, labels)).toBe('Final · 3 MATCHES');
  });

  it('falls back to "FINAL" when labels is empty', () => {
    expect(resolveBadgeText(undefined, graph, [])).toBe('FINAL · 3 MATCHES');
  });

  it('returns just the final label when graph has no nodes', () => {
    expect(resolveBadgeText(undefined, { nodes: {}, adj: {} }, labels)).toBe('Final');
  });

  it('returns "FINAL" when graph has no nodes and labels is empty', () => {
    expect(resolveBadgeText(undefined, { nodes: {}, adj: {} }, [])).toBe('FINAL');
  });
});

// ── getTranslateExtent ────────────────────────────────────────────────────────

describe('getTranslateExtent', () => {
  it('returns undefined for empty stageViews array', () => {
    expect(getTranslateExtent([])).toBeUndefined();
  });

  it('computes correct extent for a single stage', () => {
    const stage = {
      index: 0,
      bounds: { minX: 10, minY: 20, maxX: 200, maxY: 300, width: 190, height: 280 },
      nodeIds: [],
      label: '',
    };
    const [topLeft, bottomRight] = getTranslateExtent([stage])!;
    expect(topLeft).toEqual([10 - 64, 20 - 64]);
    expect(bottomRight).toEqual([200 + 64, 300 + 64]);
  });

  it('spans min/max across multiple stages', () => {
    const s1 = {
      index: 0,
      bounds: { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 },
      nodeIds: [],
      label: '',
    };
    const s2 = {
      index: 1,
      bounds: { minX: -50, minY: 10, maxX: 300, maxY: 400, width: 350, height: 390 },
      nodeIds: [],
      label: '',
    };
    const [topLeft, bottomRight] = getTranslateExtent([s1, s2])!;
    expect(topLeft[0]).toBe(-50 - 64);
    expect(topLeft[1]).toBe(0 - 64);
    expect(bottomRight[0]).toBe(300 + 64);
    expect(bottomRight[1]).toBe(400 + 64);
  });
});
