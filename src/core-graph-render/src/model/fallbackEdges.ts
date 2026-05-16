import {
  type EdgeData,
  EdgeType,
  type PositionedEdge,
  type PositionedNode,
} from '@graph-render/types';

export const buildFallbackEdges = (
  positionedNodes: readonly PositionedNode[],
  edges: readonly EdgeData[]
): readonly PositionedEdge[] => {
  const nodeMap = new Map(positionedNodes.map((node) => [node.id, node]));

  return edges.flatMap((edge) => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);

    if (!source || !target) {
      return [];
    }

    const sourceWidth = source.size?.width ?? 0;
    const sourceHeight = source.size?.height ?? 0;
    const targetWidth = target.size?.width ?? 0;
    const targetHeight = target.size?.height ?? 0;

    if (source.id === target.id) {
      const right = source.position.x + sourceWidth;
      const top = source.position.y;
      return [
        {
          ...edge,
          type: edge.type ?? EdgeType.Directed,
          points: [
            {
              x: right - Math.min(sourceWidth * 0.25, 18),
              y: top + Math.min(sourceHeight * 0.35, 18),
            },
            { x: right + 28, y: top - 20 },
            { x: right + 36, y: top + sourceHeight / 2 },
            { x: right - Math.min(sourceWidth * 0.25, 18), y: top + sourceHeight * 0.8 },
          ],
        },
      ];
    }

    return [
      {
        ...edge,
        type: edge.type ?? EdgeType.Directed,
        points: [
          {
            x: source.position.x + sourceWidth / 2,
            y: source.position.y + sourceHeight / 2,
          },
          {
            x: target.position.x + targetWidth / 2,
            y: target.position.y + targetHeight / 2,
          },
        ],
      },
    ];
  });
};
