import type { Point } from '@graph-render/types';

export const calculateLabelPosition = (points: readonly Point[]): Point | undefined => {
  if (points.length < 2) {
    return undefined;
  }

  const segmentLengths = points.slice(1).map((point, index) => {
    const previous = points[index];
    if (!previous) {
      return 0;
    }
    return Math.hypot(point.x - previous.x, point.y - previous.y);
  });
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);
  const halfway = totalLength / 2;
  let traversed = 0;

  for (const [index, length] of segmentLengths.entries()) {
    if (traversed + length >= halfway) {
      const start = points[index];
      const end = points[index + 1];
      if (!start || !end) {
        break;
      }
      const ratio = length === 0 ? 0 : (halfway - traversed) / length;
      return {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      };
    }
    traversed += length;
  }

  return points[Math.floor(points.length / 2)] ?? points[0];
};
