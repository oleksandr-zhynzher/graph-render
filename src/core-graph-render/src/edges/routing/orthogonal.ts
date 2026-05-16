import { NodeSide, Point } from '@graph-render/types';
import { getSideNormal } from '../geometry';
import { OrthogonalRoutingStyle } from './types';

const ORTHOGONAL_TERMINAL_SEGMENT = 20;

export const calculateOrthogonalPoints = (
  startPoint: Point,
  endPoint: Point,
  sourceCenter: Point,
  targetCenter: Point,
  routingStyle: OrthogonalRoutingStyle,
  parallelOffset: number,
  sourceSide: NodeSide,
  targetSide: NodeSide
): Point[] => {
  const sourceNormal = getSideNormal(sourceSide);
  const targetNormal = getSideNormal(targetSide);
  const startLead = {
    x: startPoint.x + sourceNormal.x * ORTHOGONAL_TERMINAL_SEGMENT,
    y: startPoint.y + sourceNormal.y * ORTHOGONAL_TERMINAL_SEGMENT,
  };
  const endLead = {
    x: endPoint.x + targetNormal.x * ORTHOGONAL_TERMINAL_SEGMENT,
    y: endPoint.y + targetNormal.y * ORTHOGONAL_TERMINAL_SEGMENT,
  };
  const dx = endLead.x - startLead.x;
  const dy = endLead.y - startLead.y;
  const sourceIsHorizontal = sourceNormal.x !== 0;
  const targetIsHorizontal = targetNormal.x !== 0;
  const sourceIsVertical = sourceNormal.y !== 0;
  const targetIsVertical = targetNormal.y !== 0;
  const preferHorizontalRun =
    (sourceIsHorizontal && targetIsHorizontal) ||
    (!(sourceIsVertical && targetIsVertical) && Math.abs(dx) >= Math.abs(dy));

  if (preferHorizontalRun) {
    const midX =
      routingStyle === 'bundled'
        ? (sourceCenter.x + targetCenter.x) / 2 + parallelOffset * 0.5
        : startLead.x + dx / 2;

    return [
      startPoint,
      startLead,
      { x: midX, y: startLead.y },
      { x: midX, y: endLead.y },
      endLead,
      endPoint,
    ];
  }

  const midY =
    routingStyle === 'bundled'
      ? (sourceCenter.y + targetCenter.y) / 2 + parallelOffset * 0.5
      : startLead.y + dy / 2;

  return [
    startPoint,
    startLead,
    { x: startLead.x, y: midY },
    { x: endLead.x, y: midY },
    endLead,
    endPoint,
  ];
};
