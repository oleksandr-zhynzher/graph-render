import type {
  EdgeRenderer,
  NodeRenderer,
  PositionedEdge,
  PositionedNode,
  RenderTheme,
} from '@graph-render/types';

import { buildEdgePath } from '../../edges';

export const renderEdgesToSvg = (
  edges: readonly PositionedEdge[],
  curveEdges: boolean,
  curveStrength: number,
  edgeRenderer: EdgeRenderer,
  theme: RenderTheme,
  markerId: string
): string => {
  return edges
    .map((edge) => {
      const pathD = buildEdgePath(edge, curveEdges, curveStrength);
      if (!pathD) return '';
      return edgeRenderer(edge, pathD, {
        edgeColor: theme.edgeColor,
        edgeWidth: theme.edgeWidth,
        edgeLabelColor: theme.edgeLabelColor,
        markerId,
      });
    })
    .join('');
};

export const renderNodesToSvg = (
  nodes: readonly PositionedNode[],
  nodeRenderer: NodeRenderer
): string => {
  return nodes
    .map((node) => {
      const body = nodeRenderer(node);
      return `<g transform="translate(${node.position.x}, ${node.position.y})">${body}</g>`;
    })
    .join('');
};
