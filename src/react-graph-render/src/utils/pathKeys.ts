import type { NodeWithPathMeta } from '../models/utils';

const getPathKeyName = (entry: unknown): string | null => {
  if (typeof entry === 'string') {
    return entry;
  }

  if (
    typeof entry === 'object' &&
    entry !== null &&
    'name' in entry &&
    typeof entry.name === 'string'
  ) {
    return entry.name;
  }

  return null;
};

export function normalizePathKey(value: string): string {
  return value.trim().toLowerCase();
}

export function extractPathKeysFromNodes(
  nodes: readonly NodeWithPathMeta[]
): ReadonlyMap<string, readonly string[]> {
  const map = new Map<string, string[]>();

  for (const node of nodes) {
    const rawPathKeys = node.meta?.['pathKeys'];
    // Only read the generic `pathKeys` field. Domain-specific metadata must be
    // mapped to `pathKeys` by the consuming package before Graph receives it.
    const pathKeys = Array.isArray(rawPathKeys) ? rawPathKeys : [];
    const normalized = pathKeys
      .map((entry) => getPathKeyName(entry))
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (normalized.length > 0) {
      map.set(node.id, normalized);
    }
  }

  return map;
}
