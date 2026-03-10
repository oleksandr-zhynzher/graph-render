import { useRef } from 'react';

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
  const ref = useRef<{ value: T; serialized: string } | null>(null);

  const serialized = JSON.stringify(config);

  if (ref.current === null || ref.current.serialized !== serialized) {
    // Writing to a ref during render is safe when the write is idempotent
    // and deterministic for the same inputs (standard React ref-as-cache
    // pattern).
    ref.current = { value: config, serialized };
  }

  return ref.current.value;
}
