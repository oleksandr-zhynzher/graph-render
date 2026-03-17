import { PositionedEdge, Point } from '@graph-render/types';

/**
 * Build a straight line path from edge points
 */
const buildStraightPath = (points: Point[]): string => {
  const [start, ...rest] = points;
  return [`M ${start.x} ${start.y}`, ...rest.map((pt) => `L ${pt.x} ${pt.y}`)].join(' ');
};

/**
 * Build a curved path for two-point edges
 */
const buildTwoPointCurvedPath = (start: Point, end: Point, curveStrength: number): string => {
  if (start.y === end.y) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  const midX = start.x + (end.x - start.x) * 0.55;
  const dirY = Math.sign(end.y - start.y) || 1;
  const dirX = Math.sign(end.x - start.x) || 1;
  const radiusBase = Math.min(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
  const r = Math.max(4, radiusBase * Math.min(Math.max(curveStrength, 0), 0.45));

  const p1x = midX - r * dirX;
  const p1y = start.y;
  const p2x = midX;
  const p2y = start.y + r * dirY;
  const p3x = midX;
  const p3y = end.y - r * dirY;
  const p4x = midX + r * dirX;
  const p4y = end.y;

  return [
    `M ${start.x} ${start.y}`,
    `L ${p1x} ${p1y}`,
    `Q ${midX} ${p1y} ${p2x} ${p2y}`,
    `L ${p3x} ${p3y}`,
    `Q ${midX} ${end.y} ${p4x} ${p4y}`,
    `L ${end.x} ${end.y}`,
  ].join(' ');
};

/**
 * Build a quadratic bezier path for three-point edges
 */
const buildThreePointPath = (start: Point, control: Point, end: Point): string => {
  return `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
};

/**
 * Build a cubic bezier path for six-point edges (standard curved edge)
 */
const buildSixPointPath = (points: Point[]): string => {
  const [start, out, c1, c2, straightIn, end] = points;
  return [
    `M ${start.x} ${start.y}`,
    `L ${out.x} ${out.y}`,
    `C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${straightIn.x} ${straightIn.y}`,
    `L ${end.x} ${end.y}`,
  ].join(' ');
};

/**
 * Build a path with multiple quadratic curves for variable-length edges
 */
const buildMultiPointPath = (points: Point[]): string => {
  const [start, ...rest] = points;
  const commands = [`M ${start.x} ${start.y}`];

  if (rest.length) {
    commands.push(`L ${rest[0].x} ${rest[0].y}`);
  }

  for (let i = 1; i < rest.length - 1; i += 1) {
    const ctrl = rest[i];
    const next = rest[i + 1];
    const isLastCurve = i === rest.length - 2;
    if (isLastCurve) {
      // FIX: removed the trailing `L rest[last]` that duplicated the Q endpoint.
      // When isLastCurve is true, `next === rest[rest.length - 1]`, so the Q
      // command already terminates at the final point.  The extra L produced a
      // zero-length segment that misplaced SVG `marker-end` arrowheads.
      commands.push(`Q ${ctrl.x} ${ctrl.y} ${next.x} ${next.y}`);
      break;
    }
    commands.push(`Q ${ctrl.x} ${ctrl.y} ${next.x} ${next.y}`);
  }

  if (rest.length === 2) {
    const [ctrl, end] = rest;
    commands.push(`Q ${ctrl.x} ${ctrl.y} ${end.x} ${end.y}`);
  }

  return commands.join(' ');
};

/**
 * Build an SVG path string from edge points.
 *
 * Returns null (instead of throwing) when the edge has fewer than two points so
 * that a malformed edge from a user-supplied routeEdgesOverride does not crash
 * the React render tree.  Both callers (EdgePath and svg.ts) already guard
 * against a falsy return value.
 */
export const buildEdgePath = (
  edge: PositionedEdge,
  curveEdges: boolean,
  curveStrength: number
): string | null => {
  // FIX: was `throw new Error(...)` — returning null lets callers handle
  // the bad edge gracefully without an unhandled exception in render.
  if (edge.points.length < 2) {
    return null;
  }

  if (!curveEdges) {
    return buildStraightPath(edge.points);
  }

  if (edge.points.length === 2) {
    const [start, end] = edge.points;
    return buildTwoPointCurvedPath(start, end, curveStrength);
  }

  if (edge.points.length === 3) {
    const [start, control, end] = edge.points;
    return buildThreePointPath(start, control, end);
  }

  if (edge.points.length >= 6) {
    return buildSixPointPath(edge.points);
  }

  return buildMultiPointPath(edge.points);
};
