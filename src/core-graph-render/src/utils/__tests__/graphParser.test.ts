import { EdgeType, GraphInputValidationMode, type NxEdgeAttrs } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { processNodeEdges } from '../graphParser/edges';
import { buildNodeMap } from '../graphParser/nodes';
import { sanitizeEdgePoints } from '../graphParser/sanitizers';

// ---------------------------------------------------------------------------
// createEdgeData (tested indirectly – not exported)
// Verifies that user-supplied ...rest attributes cannot override the canonical
// `source` and `target` fields that processNodeEdges passes to createEdgeData.
// ---------------------------------------------------------------------------

describe('createEdgeData (via processNodeEdges)', () => {
  it('canonical source wins over a spoofed source in attrs', () => {
    const edges = processNodeEdges(
      'real-source',
      // Cast past the type guard: NxEdgeAttrs omits source/target intentionally,
      // but we need to verify the runtime invariant still holds.
      { 'real-target': { id: 'e1', source: 'spoofed-source' } as unknown as NxEdgeAttrs },
      EdgeType.Directed,
      GraphInputValidationMode.Implicit,
      new Map(),
      new Set(),
      new Set()
    );

    expect(edges).toHaveLength(1);
    expect(edges[0]!.source).toBe('real-source');
  });

  it('canonical target wins over a spoofed target in attrs', () => {
    const edges = processNodeEdges(
      'real-source',
      // NxEdgeAttrs omits source/target; cast through unknown to verify runtime invariant
      { 'real-target': { id: 'e1', target: 'spoofed-target' } as unknown as NxEdgeAttrs },
      EdgeType.Directed,
      GraphInputValidationMode.Implicit,
      new Map(),
      new Set(),
      new Set()
    );

    expect(edges).toHaveLength(1);
    expect(edges[0]!.target).toBe('real-target');
  });
});

// ---------------------------------------------------------------------------
// buildNodeMap
// ---------------------------------------------------------------------------

describe('buildNodeMap', () => {
  it('throws TypeError with "Duplicate node id" when two raw IDs produce the same sanitized ID', () => {
    // sanitizeNodeId trims whitespace, so ' a' and 'a' both become 'a'.
    expect(() =>
      buildNodeMap({
        adj: {},
        nodes: { a: {}, ' a': {} },
      })
    ).toThrow(TypeError);

    expect(() =>
      buildNodeMap({
        adj: {},
        nodes: { a: {}, ' a': {} },
      })
    ).toThrow('Duplicate node id');
  });
});

// ---------------------------------------------------------------------------
// sanitizeEdgePoints
// ---------------------------------------------------------------------------

describe('sanitizeEdgePoints', () => {
  it('returns valid points array unchanged', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 20 },
      { x: 30, y: 40 },
    ];
    expect(sanitizeEdgePoints(points)).toEqual(points);
  });

  it('returns undefined (not a partial array) when any point has a NaN coordinate', () => {
    expect(
      sanitizeEdgePoints([
        { x: 1, y: 2 },
        { x: Number.NaN, y: 4 },
      ])
    ).toBeUndefined();
  });

  it('returns undefined when any point has an Infinite coordinate', () => {
    expect(
      sanitizeEdgePoints([
        { x: Number.POSITIVE_INFINITY, y: 2 },
        { x: 3, y: 4 },
      ])
    ).toBeUndefined();

    expect(
      sanitizeEdgePoints([
        { x: 1, y: Number.NEGATIVE_INFINITY },
        { x: 3, y: 4 },
      ])
    ).toBeUndefined();
  });
});
