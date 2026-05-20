import { GraphInputValidationMode, type NxNodeAttrs } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { assertNodeExists, buildNodeMap } from '../nodes';

describe('buildNodeMap', () => {
  it('returns an empty map for a graph with no nodes', () => {
    const map = buildNodeMap({ adj: {} });
    expect(map.size).toBe(0);
  });

  it('builds a map with one entry per node', () => {
    const map = buildNodeMap({ adj: {}, nodes: { a: {}, b: {} } });
    expect(map.size).toBe(2);
    expect(map.has('a')).toBe(true);
    expect(map.has('b')).toBe(true);
  });

  it('trims whitespace from node ids', () => {
    const map = buildNodeMap({ adj: {}, nodes: { ' x ': {} } });
    expect(map.has('x')).toBe(true);
    expect(map.has(' x ')).toBe(false);
  });

  it('throws TypeError for duplicate normalized ids', () => {
    expect(() =>
      buildNodeMap({
        adj: {},
        nodes: { a: {}, ' a': {} },
      })
    ).toThrow(TypeError);
  });

  it('preserves node attributes (label)', () => {
    const map = buildNodeMap({ adj: {}, nodes: { a: { label: 'Node A' } } });
    expect(map.get('a')!.label).toBe('Node A');
  });

  it('throws TypeError when node attrs is a non-object non-null value', () => {
    expect(() => buildNodeMap({ adj: {}, nodes: { a: 'bad' as unknown as NxNodeAttrs } })).toThrow(
      TypeError
    );
  });
});

describe('assertNodeExists', () => {
  it('adds missing node in Implicit mode', () => {
    const map = new Map<string, { id: string }>();
    assertNodeExists(map, 'new-node', 'source', GraphInputValidationMode.Implicit);
    expect(map.has('new-node')).toBe(true);
  });

  it('does not throw when node exists in Strict mode', () => {
    const map = new Map<string, { id: string }>([['n1', { id: 'n1' }]]);
    expect(() =>
      assertNodeExists(map, 'n1', 'source', GraphInputValidationMode.Strict)
    ).not.toThrow();
  });

  it('throws TypeError when node is missing in Strict mode', () => {
    const map = new Map<string, { id: string }>();
    expect(() =>
      assertNodeExists(map, 'missing', 'target', GraphInputValidationMode.Strict)
    ).toThrow(TypeError);
  });

  it('throws TypeError with a message mentioning kind and id', () => {
    const map = new Map<string, { id: string }>();
    expect(() => assertNodeExists(map, 'ghost', 'source', GraphInputValidationMode.Strict)).toThrow(
      'source'
    );
  });
});
