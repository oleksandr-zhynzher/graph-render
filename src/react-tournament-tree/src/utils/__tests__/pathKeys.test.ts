import { describe, expect, it } from 'vitest';

import { injectTournamentPathKeys } from '../pathKeys';

describe('injectTournamentPathKeys', () => {
  it('returns the original graph unchanged when there are no nodes', () => {
    const graph = { adj: {}, edges: [] };
    const result = injectTournamentPathKeys(graph);
    expect(result).toBe(graph);
  });

  it('returns the same graph reference when nodes has no players', () => {
    const graph = { adj: {}, nodes: { n1: { id: 'n1', meta: {} } }, edges: [] };
    const result = injectTournamentPathKeys(graph);
    expect(result).toBe(graph);
  });

  it('injects pathKeys from player names', () => {
    const graph = {
      adj: {},
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
      },
      edges: [],
    };
    const result = injectTournamentPathKeys(graph);
    expect(result.nodes?.['n1']?.meta?.['pathKeys']).toEqual(['Alice', 'Bob']);
  });

  it('trims whitespace from player names', () => {
    const graph = {
      adj: {},
      nodes: {
        n1: {
          id: 'n1',
          meta: { players: [{ name: '  Alice  ', seed: 1 }] },
        },
      },
      edges: [],
    };
    const result = injectTournamentPathKeys(graph);
    expect(result.nodes?.['n1']?.meta?.['pathKeys']).toEqual(['Alice']);
  });

  it('filters out players with empty names', () => {
    const graph = {
      adj: {},
      nodes: {
        n1: {
          id: 'n1',
          meta: {
            players: [
              { name: '', seed: 1 },
              { name: 'Bob', seed: 2 },
            ],
          },
        },
      },
      edges: [],
    };
    const result = injectTournamentPathKeys(graph);
    expect(result.nodes?.['n1']?.meta?.['pathKeys']).toEqual(['Bob']);
  });

  it('does not inject pathKeys when all player names are empty', () => {
    const graph = {
      adj: {},
      nodes: {
        n1: {
          id: 'n1',
          meta: {
            players: [
              { name: '', seed: 1 },
              { name: '   ', seed: 2 },
            ],
          },
        },
      },
      edges: [],
    };
    const result = injectTournamentPathKeys(graph);
    // No change — same reference
    expect(result).toBe(graph);
  });

  it('filters out non-object and null players', () => {
    const graph = {
      adj: {},
      nodes: {
        n1: {
          id: 'n1',
          meta: { players: [null, undefined, 42, { name: 'Carol', seed: 1 }] },
        },
      },
      edges: [],
    };
    const result = injectTournamentPathKeys(graph);
    expect(result.nodes?.['n1']?.meta?.['pathKeys']).toEqual(['Carol']);
  });

  it('preserves existing meta fields alongside injected pathKeys', () => {
    const graph = {
      adj: {},
      nodes: {
        n1: {
          id: 'n1',
          meta: { status: 'completed', players: [{ name: 'Alice', seed: 1 }] },
        },
      },
      edges: [],
    };
    const result = injectTournamentPathKeys(graph);
    expect(result.nodes?.['n1']?.meta?.['status']).toBe('completed');
    expect(result.nodes?.['n1']?.meta?.['pathKeys']).toEqual(['Alice']);
  });

  it('handles a mix of nodes with and without players', () => {
    const graph = {
      adj: {},
      nodes: {
        n1: { id: 'n1', meta: { players: [{ name: 'Alice', seed: 1 }] } },
        n2: { id: 'n2', meta: {} },
      },
      edges: [],
    };
    const result = injectTournamentPathKeys(graph);
    expect(result.nodes?.['n1']?.meta?.['pathKeys']).toEqual(['Alice']);
    expect(result.nodes?.['n2']?.meta?.['pathKeys']).toBeUndefined();
  });

  it('returns a new graph object reference when any node is changed', () => {
    const graph = {
      adj: {},
      nodes: { n1: { id: 'n1', meta: { players: [{ name: 'Alice', seed: 1 }] } } },
      edges: [],
    };
    const result = injectTournamentPathKeys(graph);
    expect(result).not.toBe(graph);
  });
});
