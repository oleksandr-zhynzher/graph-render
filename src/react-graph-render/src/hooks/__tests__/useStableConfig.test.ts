import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useStableConfig } from '../useStableConfig';

describe('useStableConfig', () => {
  it('returns the same reference for identical primitive values', () => {
    const config = { a: 1, b: 'hello', c: true };
    const { result, rerender } = renderHook(({ cfg }) => useStableConfig(cfg), {
      initialProps: { cfg: config },
    });
    const first = result.current;
    rerender({ cfg: { a: 1, b: 'hello', c: true } });
    expect(result.current).toBe(first);
  });

  it('returns a new reference when a primitive value changes', () => {
    const { result, rerender } = renderHook(({ cfg }) => useStableConfig(cfg), {
      initialProps: { cfg: { x: 1 } },
    });
    const first = result.current;
    rerender({ cfg: { x: 2 } });
    expect(result.current).not.toBe(first);
  });

  it('returns the same reference for equal nested objects', () => {
    const { result, rerender } = renderHook(({ cfg }) => useStableConfig(cfg), {
      initialProps: { cfg: { theme: { color: '#fff' } } },
    });
    const first = result.current;
    rerender({ cfg: { theme: { color: '#fff' } } });
    expect(result.current).toBe(first);
  });

  it('returns a new reference when a nested value changes', () => {
    const { result, rerender } = renderHook(({ cfg }) => useStableConfig(cfg), {
      initialProps: { cfg: { theme: { color: '#fff' } } },
    });
    const first = result.current;
    rerender({ cfg: { theme: { color: '#000' } } });
    expect(result.current).not.toBe(first);
  });

  it('returns the same reference for equal arrays', () => {
    const { result, rerender } = renderHook(({ cfg }) => useStableConfig(cfg), {
      initialProps: { cfg: { labels: ['a', 'b'] } },
    });
    const first = result.current;
    rerender({ cfg: { labels: ['a', 'b'] } });
    expect(result.current).toBe(first);
  });

  it('returns a new reference when array contents change', () => {
    const { result, rerender } = renderHook(({ cfg }) => useStableConfig(cfg), {
      initialProps: { cfg: { labels: ['a'] } },
    });
    const first = result.current;
    rerender({ cfg: { labels: ['a', 'b'] } });
    expect(result.current).not.toBe(first);
  });

  it('considers function-typed values as always unequal', () => {
    const fn1 = () => {};
    const fn2 = () => {};
    const { result, rerender } = renderHook(({ cfg }) => useStableConfig(cfg), {
      initialProps: { cfg: { fn: fn1 } },
    });
    const first = result.current;
    rerender({ cfg: { fn: fn2 } });
    // Different function references → new config reference
    expect(result.current).not.toBe(first);
  });

  it('handles null and undefined gracefully', () => {
    const { result } = renderHook(() => useStableConfig(null));
    expect(result.current).toBeNull();
  });

  it('handles primitives directly', () => {
    const { result, rerender } = renderHook(({ cfg }) => useStableConfig(cfg), {
      initialProps: { cfg: 42 as any },
    });
    expect(result.current).toBe(42);
    rerender({ cfg: 42 as any });
    expect(result.current).toBe(42);
  });
});
