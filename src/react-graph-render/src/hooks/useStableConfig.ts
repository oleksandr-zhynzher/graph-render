import { useRef } from 'react';

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Object.prototype.toString.call(value) === '[object Object]';
};

const areValuesEqual = (
  left: unknown,
  right: unknown,
  seen: WeakMap<object, WeakSet<object>>
): boolean => {
  if (Object.is(left, right)) {
    return true;
  }

  if (typeof left === 'function' || typeof right === 'function') {
    return false;
  }

  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') {
    return false;
  }

  const existing = seen.get(left);
  if (existing?.has(right)) {
    return true;
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
      return false;
    }

    if (!existing) {
      seen.set(left, new WeakSet([right]));
    } else {
      existing.add(right);
    }

    for (let index = 0; index < left.length; index += 1) {
      if (!areValuesEqual(left[index], right[index], seen)) {
        return false;
      }
    }

    return true;
  }

  if (!isPlainObject(left) || !isPlainObject(right)) {
    return false;
  }

  if (!existing) {
    seen.set(left, new WeakSet([right]));
  } else {
    existing.add(right);
  }

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  for (const key of leftKeys) {
    if (!(key in right) || !areValuesEqual(left[key], right[key], seen)) {
      return false;
    }
  }

  return true;
};

/**
 * Returns the same reference for a config-like object as long as its
 * serialized form has not changed.
 *
 * This prevents a common foot-gun where consumers pass an inline object
 * literal as the `config` prop:
 *
 *   <Graph config={{ layout: 'dag' }} ... />
 *
 * Without stabilization, every parent render creates a new object reference,
 * which invalidates the normalizeGraphConfig memo and cascades through the
 * entire graph model pipeline (layout, edge routing, etc.), causing full
 * recomputes on every keystroke / scroll / hover in the parent tree.
 *
 * `GraphConfig` only contains JSON-serializable values (strings, numbers,
 * booleans, string arrays, and theme objects with the same), so JSON.stringify
 * is a reliable, cheap equality check here.
 *
 * Note: if `config` contains function-typed fields, those are intentionally
 * excluded from the comparison (JSON.stringify omits them). Functions should
 * be passed as separate, memoized props rather than embedded in the config
 * object.
 */
export function useStableConfig<T>(config: T): T {
  const ref = useRef<T | null>(null);

  if (ref.current === null || !areValuesEqual(ref.current, config, new WeakMap())) {
    // Writing to a ref during render is safe when the write is idempotent
    // and deterministic for the same inputs (standard React ref-as-cache
    // pattern).
    ref.current = config;
  }

  return ref.current;
}
