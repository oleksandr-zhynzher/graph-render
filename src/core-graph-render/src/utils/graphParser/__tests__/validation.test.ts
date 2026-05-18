import { GraphInputValidationMode, type NxGraphInput } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { assertValidGraphInput, resolveInputValidationMode } from '../validation';

describe('assertValidGraphInput', () => {
  it('does not throw for a minimal valid graph', () => {
    expect(() => assertValidGraphInput({ adj: {}, nodes: {} })).not.toThrow();
  });

  it('throws TypeError when input is not a plain object', () => {
    expect(() => assertValidGraphInput(null as unknown as NxGraphInput)).toThrow(TypeError);
    expect(() => assertValidGraphInput('string' as unknown as NxGraphInput)).toThrow(TypeError);
  });

  it('throws TypeError when adj is missing', () => {
    expect(() => assertValidGraphInput({} as unknown as NxGraphInput)).toThrow(TypeError);
  });

  it('throws TypeError when adj is not an object', () => {
    expect(() => assertValidGraphInput({ adj: 42 } as unknown as NxGraphInput)).toThrow(TypeError);
  });

  it('throws TypeError when nodes is provided but not an object', () => {
    expect(() =>
      assertValidGraphInput({ adj: {}, nodes: 'bad' } as unknown as NxGraphInput)
    ).toThrow(TypeError);
  });

  it('throws TypeError when an adjacency entry is not an object', () => {
    expect(() => assertValidGraphInput({ adj: { a: 42 } } as unknown as NxGraphInput)).toThrow(
      TypeError
    );
  });

  it('throws TypeError when edge attributes array is empty', () => {
    expect(() => assertValidGraphInput({ adj: { a: { b: [] } } })).toThrow(TypeError);
  });

  it('throws TypeError when edge attrs item is not an object', () => {
    expect(() =>
      assertValidGraphInput({ adj: { a: { b: [42] } } } as unknown as NxGraphInput)
    ).toThrow(TypeError);
  });

  it('does not throw for a graph with edges', () => {
    expect(() =>
      assertValidGraphInput({
        adj: { a: { b: { id: 'e1' } } },
        nodes: { a: {}, b: {} },
      })
    ).not.toThrow();
  });
});

describe('resolveInputValidationMode', () => {
  it('returns Strict when explicitly set in options', () => {
    const mode = resolveInputValidationMode(
      { adj: {} },
      { inputValidationMode: GraphInputValidationMode.Strict }
    );
    expect(mode).toBe(GraphInputValidationMode.Strict);
  });

  it('returns Implicit when explicitly set in options', () => {
    const mode = resolveInputValidationMode(
      { adj: {}, nodes: { a: {} } },
      { inputValidationMode: GraphInputValidationMode.Implicit }
    );
    expect(mode).toBe(GraphInputValidationMode.Implicit);
  });

  it('returns Strict when graph has explicit node definitions', () => {
    const mode = resolveInputValidationMode({ adj: {}, nodes: { a: {} } });
    expect(mode).toBe(GraphInputValidationMode.Strict);
  });

  it('returns Implicit when graph has no explicit node definitions', () => {
    const mode = resolveInputValidationMode({ adj: {} });
    expect(mode).toBe(GraphInputValidationMode.Implicit);
  });

  it('returns Implicit when graph.nodes is empty', () => {
    const mode = resolveInputValidationMode({ adj: {}, nodes: {} });
    expect(mode).toBe(GraphInputValidationMode.Implicit);
  });
});
