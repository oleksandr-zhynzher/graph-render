import type { Point, PositionedNode, Size } from '@graph-render/types';

export const createSelfLoopPoints = (
  node: PositionedNode,
  size: Size,
  loopRadius: number,
  offset: number
): readonly Point[] => {
  const right = node.position.x + size.width;
  const top = node.position.y;
  const anchorX = right - Math.min(size.width * 0.2, 16);
  const anchorY = top + Math.min(size.height * 0.3, 20);
  const loopX = right + loopRadius + offset;
  const loopTop = top - loopRadius - Math.abs(offset) * 0.4;
  const loopBottom = top + size.height * 0.75 + Math.abs(offset) * 0.3;

  return [
    { x: anchorX, y: anchorY },
    { x: loopX * 0.92, y: loopTop },
    { x: loopX, y: loopTop },
    { x: loopX, y: loopBottom },
    { x: anchorX, y: top + size.height * 0.82 },
  ];
};
