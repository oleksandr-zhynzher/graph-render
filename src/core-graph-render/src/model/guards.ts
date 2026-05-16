import type { Point } from '@graph-render/types';

export const isFinitePoint = (point: Point | undefined): point is Point => {
  return Boolean(point && Number.isFinite(point.x) && Number.isFinite(point.y));
};

export const toError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error(String(error));
};
