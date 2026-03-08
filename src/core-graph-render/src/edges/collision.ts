import { Point } from '@graph-render/types';

export const segmentIntersectsRect = (
  p1: Point,
  p2: Point,
  rect: { x: number; y: number; w: number; h: number }
): boolean => {
  const { x, y, w, h } = rect;
  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);
  if (maxX < x || minX > x + w || maxY < y || minY > y + h) return false;

  const inside = (px: number, py: number) => px >= x && px <= x + w && py >= y && py <= y + h;
  if (inside(p1.x, p1.y) || inside(p2.x, p2.y)) return true;

  const intersectsEdge = (x1: number, y1: number, x2: number, y2: number) => {
    const denom = (p2.y - p1.y) * (x2 - x1) - (p2.x - p1.x) * (y2 - y1);
    if (denom === 0) return false;
    const ua = ((p2.x - p1.x) * (y1 - p1.y) - (p2.y - p1.y) * (x1 - p1.x)) / denom;
    const ub = ((x2 - x1) * (y1 - p1.y) - (y2 - y1) * (x1 - p1.x)) / denom;
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  };

  const r1 = intersectsEdge(x, y, x + w, y);
  const r2 = intersectsEdge(x + w, y, x + w, y + h);
  const r3 = intersectsEdge(x + w, y + h, x, y + h);
  const r4 = intersectsEdge(x, y + h, x, y);
  return r1 || r2 || r3 || r4;
};
