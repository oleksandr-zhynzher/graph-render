import type { PointerState } from '../models/domain';

export const getPointerDistance = (a: PointerState, b: PointerState): number => {
  return Math.hypot(a.x - b.x, a.y - b.y);
};

export const getPointerMidpoint = (a: PointerState, b: PointerState): PointerState => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

export const getRelativeSvgPoint = (
  svg: SVGSVGElement | null,
  clientX: number,
  clientY: number
): PointerState => {
  if (!svg) {
    return { x: clientX, y: clientY };
  }

  const rect = svg.getBoundingClientRect();
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
};

export { type PinchState, type PointerState, type SelectionBox } from '../models/domain';
