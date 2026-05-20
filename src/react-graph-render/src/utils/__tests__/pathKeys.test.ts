import { describe, expect, it } from 'vitest';

import { extractPathKeysFromNodes, normalizePathKey } from '../pathKeys';

describe('normalizePathKey', () => {
  it('lowercases the key', () => {
    expect(normalizePathKey('ABC')).toBe('abc');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizePathKey('  key  ')).toBe('key');
  });

  it('lowercases and trims together', () => {
    expect(normalizePathKey('  FOO BAR  ')).toBe('foo bar');
  });

  it('handles empty string', () => {
    expect(normalizePathKey('')).toBe('');
  });
});

describe('extractPathKeysFromNodes', () => {
  it('returns empty map for nodes without meta', () => {
    const nodes = [{ id: 'n1' }] as any[];
    expect(extractPathKeysFromNodes(nodes).size).toBe(0);
  });

  it('returns empty map when meta.pathKeys is missing', () => {
    const nodes = [{ id: 'n1', meta: {} }] as any[];
    expect(extractPathKeysFromNodes(nodes).size).toBe(0);
  });

  it('extracts string path keys', () => {
    const nodes = [{ id: 'n1', meta: { pathKeys: ['keyA', 'keyB'] } }] as any[];
    const map = extractPathKeysFromNodes(nodes);
    expect(map.get('n1')).toEqual(['keyA', 'keyB']);
  });

  it('extracts path keys from objects with a name property', () => {
    const nodes = [{ id: 'n1', meta: { pathKeys: [{ name: 'myKey' }] } }] as any[];
    const map = extractPathKeysFromNodes(nodes);
    expect(map.get('n1')).toEqual(['myKey']);
  });

  it('ignores non-string, non-object path key entries', () => {
    const nodes = [{ id: 'n1', meta: { pathKeys: [42, null, 'valid'] } }] as any[];
    const map = extractPathKeysFromNodes(nodes);
    expect(map.get('n1')).toEqual(['valid']);
  });

  it('ignores empty string path keys', () => {
    const nodes = [{ id: 'n1', meta: { pathKeys: ['', '  ', 'real'] } }] as any[];
    const map = extractPathKeysFromNodes(nodes);
    expect(map.get('n1')).toEqual(['real']);
  });

  it('does not add entry when all path keys are invalid', () => {
    const nodes = [{ id: 'n1', meta: { pathKeys: [''] } }] as any[];
    const map = extractPathKeysFromNodes(nodes);
    expect(map.has('n1')).toBe(false);
  });

  it('skips nodes with non-array pathKeys', () => {
    const nodes = [{ id: 'n1', meta: { pathKeys: 'not-an-array' } }] as any[];
    const map = extractPathKeysFromNodes(nodes);
    expect(map.has('n1')).toBe(false);
  });

  it('handles multiple nodes', () => {
    const nodes = [
      { id: 'n1', meta: { pathKeys: ['k1'] } },
      { id: 'n2', meta: { pathKeys: ['k2', 'k3'] } },
    ] as any[];
    const map = extractPathKeysFromNodes(nodes);
    expect(map.size).toBe(2);
    expect(map.get('n1')).toEqual(['k1']);
    expect(map.get('n2')).toEqual(['k2', 'k3']);
  });
});
