import type { EdgeData, PositionedEdge, PositionedNode } from '@graph-render/types';

export function routeBracketEdges(nodes: PositionedNode[], edges: EdgeData[]): PositionedEdge[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return edges.map((edge) => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (!source || !target) {
      return { ...edge, points: [] };
    }

    const sourceWidth = source.size?.width ?? 0;
    const sourceHeight = source.size?.height ?? 0;
    const targetHeight = target.size?.height ?? 0;
    const sourceRight = source.position.x + sourceWidth;
    const targetLeft = target.position.x;
    const sourceMidY = source.position.y + sourceHeight / 2;
    const targetMidY = target.position.y + targetHeight / 2;
    const midX = (sourceRight + targetLeft) / 2;

    return {
      ...edge,
      points: [
        { x: sourceRight, y: sourceMidY },
        { x: midX, y: sourceMidY },
        { x: midX, y: targetMidY },
        { x: targetLeft, y: targetMidY },
      ],
    };
  });
}
