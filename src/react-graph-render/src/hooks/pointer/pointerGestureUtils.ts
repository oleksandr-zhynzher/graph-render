import type { PointerState } from '../../models/domain';

export const getTwoActivePointers = (
  pointers: Map<number, PointerState>
): readonly [PointerState, PointerState] | null => {
  const values = pointers.values();
  const first = values.next().value;
  const second = values.next().value;
  if (!first || !second) {
    return null;
  }
  return [first, second];
};
