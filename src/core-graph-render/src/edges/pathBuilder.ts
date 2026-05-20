import type { Point, PositionedEdge } from '@graph-render/types';

/**
 * Build a straight line path from edge points
 */
const buildStraightPath = (points: readonly Point[]): string => {
  const start = getPointAt(points, 0);
  const rest = points.slice(1);
  return [`M ${start.x} ${start.y}`, ...rest.map((pt) => `L ${pt.x} ${pt.y}`)].join(' ');
};

const getPointAt = (points: readonly Point[], index: number): Point => {
  const point = points[index];
  if (!point) {
    throw new Error(`Expected edge point at index ${index}.`);
  }
  return point;
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
const buildSixPointPath = (points: readonly Point[]): string => {
  const start = getPointAt(points, 0);
  const out = getPointAt(points, 1);
  const c1 = getPointAt(points, 2);
  const c2 = getPointAt(points, 3);
  const straightIn = getPointAt(points, 4);
  const end = getPointAt(points, 5);
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
const buildMultiPointPath = (points: readonly Point[]): string => {
  const start = getPointAt(points, 0);
  const rest = points.slice(1);
  const commands = [`M ${start.x} ${start.y}`];

  if (rest.length > 0) {
    const first = getPointAt(rest, 0);
    commands.push(`L ${first.x} ${first.y}`);
  }

  for (let i = 1; i < rest.length - 1; i += 1) {
    const ctrl = getPointAt(rest, i);
    const next = getPointAt(rest, i + 1);
    const isLastCurve = i === rest.length - 2;
    if (isLastCurve) {
      // The final Q command already terminates at the edge endpoint.
      commands.push(`Q ${ctrl.x} ${ctrl.y} ${next.x} ${next.y}`);
      break;
    }
    commands.push(`Q ${ctrl.x} ${ctrl.y} ${next.x} ${next.y}`);
  }

  if (rest.length === 2) {
    const ctrl = getPointAt(rest, 0);
    const end = getPointAt(rest, 1);
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
  if (edge.points.length < 2) {
    return null;
  }

  if (!curveEdges) {
    return buildStraightPath(edge.points);
  }

  if (edge.points.length === 2) {
    const start = getPointAt(edge.points, 0);
    const end = getPointAt(edge.points, 1);
    return buildTwoPointCurvedPath(start, end, curveStrength);
  }

  if (edge.points.length === 3) {
    const start = getPointAt(edge.points, 0);
    const control = getPointAt(edge.points, 1);
    const end = getPointAt(edge.points, 2);
    return buildThreePointPath(start, control, end);
  }

  if (edge.points.length >= 6) {
    return buildSixPointPath(edge.points);
  }

  return buildMultiPointPath(edge.points);
};
