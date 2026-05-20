import {
  EdgeType,
  GraphInputValidationMode,
  type NodeData,
  type NxEdgeAttrs,
} from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { normalizeEdgeAttributes, processNodeEdges } from '../edges';

describe('normalizeEdgeAttributes', () => {
  it('wraps a single edge attrs object in an array', () => {
    const attrs = { id: 'e1' };
    const result = normalizeEdgeAttributes(attrs);
    expect(result).toEqual([attrs]);
  });

  it('returns the array as-is when already an array', () => {
    const attrs = [{ id: 'e1' }, { id: 'e2' }];
    const result = normalizeEdgeAttributes(attrs);
    expect(result).toEqual(attrs);
  });

  it('wraps an object with no id field', () => {
    const attrs = {};
    const result = normalizeEdgeAttributes(attrs);
    expect(result).toHaveLength(1);
  });
});

describe('processNodeEdges', () => {
  const defaultArgs = (
    neighbors: Record<string, NxEdgeAttrs | readonly NxEdgeAttrs[]>
  ): [
    string,
    Record<string, NxEdgeAttrs | readonly NxEdgeAttrs[]>,
    EdgeType,
    GraphInputValidationMode,
    Map<string, NodeData>,
    Set<string>,
    Set<string>,
  ] => [
    'source-node',
    neighbors,
    EdgeType.Directed,
    GraphInputValidationMode.Implicit,
    new Map<string, NodeData>(),
    new Set<string>(),
    new Set<string>(),
  ];

  it('returns empty array when neighbors is empty', () => {
    const result = processNodeEdges(...defaultArgs({}));
    expect(result).toHaveLength(0);
  });

  it('creates one edge per neighbor', () => {
    const result = processNodeEdges(...defaultArgs({ 'target-a': { id: 'e1' } }));
    expect(result).toHaveLength(1);
    expect(result[0]!.source).toBe('source-node');
    expect(result[0]!.target).toBe('target-a');
  });

  it('creates multiple edges from an array of attrs', () => {
    const result = processNodeEdges(...defaultArgs({ 'target-a': [{ id: 'e1' }, { id: 'e2' }] }));
    expect(result).toHaveLength(2);
  });

  it('deduplicates undirected edges seen from both directions', () => {
    const undirectedSeen = new Set<string>();
    // Process a→b

    const first = processNodeEdges(
      'a',
      { b: { id: 'e1', type: EdgeType.Undirected } },
      EdgeType.Undirected,
      GraphInputValidationMode.Implicit,
      new Map<string, NodeData>(),
      undirectedSeen,
      new Set<string>()
    );
    // Process b→a (should be deduped)

    const second = processNodeEdges(
      'b',
      { a: { id: 'e2', type: EdgeType.Undirected } },
      EdgeType.Undirected,
      GraphInputValidationMode.Implicit,
      new Map<string, NodeData>(),
      undirectedSeen,
      new Set<string>(['e1'])
    );
    expect(first).toHaveLength(1);
    expect(second).toHaveLength(0);
  });

  it('canonical source always matches the provided source argument', () => {
    const result = processNodeEdges(
      'real-source',
      // NxEdgeAttrs omits source/target; cast through unknown to verify the runtime invariant
      { 'real-target': { id: 'e1', source: 'spoofed' } as unknown as NxEdgeAttrs },
      EdgeType.Directed,
      GraphInputValidationMode.Implicit,
      new Map<string, NodeData>(),
      new Set<string>(),
      new Set<string>()
    );
    expect(result[0]!.source).toBe('real-source');
  });

  it('throws for duplicate edge id', () => {
    expect(() =>
      processNodeEdges(
        'a',
        { b: [{ id: 'same' }, { id: 'same' }] },
        EdgeType.Directed,
        GraphInputValidationMode.Implicit,
        new Map<string, NodeData>(),
        new Set<string>(),
        new Set<string>()
      )
    ).toThrow(TypeError);
  });
});
