import type { PositionedNode } from '@graph-render/types';
import type { SquashMatchMeta, SquashPositionedNode } from '@graph-render/types/tournament';

const isSquashMatchMeta = (value: unknown): value is SquashMatchMeta => {
  if (value == null || typeof value !== 'object') {
    return false;
  }

  const meta = value as SquashMatchMeta;
  return meta.players == null || Array.isArray(meta.players);
};

export const isSquashPositionedNode = (node: PositionedNode): boolean => {
  if (node.meta == null) {
    return false;
  }

  return isSquashMatchMeta(node.meta);
};

export const toSquashPositionedNode = (node: PositionedNode): SquashPositionedNode | null => {
  return isSquashPositionedNode(node) ? (node as SquashPositionedNode) : null;
};
