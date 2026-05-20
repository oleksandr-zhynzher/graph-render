import type { PositionedEdge, PositionedNode } from '@graph-render/types';
import type { GraphViewport } from '@graph-render/types/react';
import { useMemo } from 'react';

import { filterEdgesInViewport, filterNodesInViewport } from '../utils/viewportCulling';

interface UseGraphCullingOptions {
  readonly enabled: boolean;
  readonly edges: readonly PositionedEdge[];
  readonly height: number;
  readonly nodes: readonly PositionedNode[];
  readonly viewport: GraphViewport;
  readonly width: number;
}

interface UseGraphCullingResult {
  readonly culledEdges: readonly PositionedEdge[];
  readonly culledNodes: readonly PositionedNode[];
}

export const useGraphCulling = ({
  enabled,
  edges,
  height,
  nodes,
  viewport,
  width,
}: UseGraphCullingOptions): UseGraphCullingResult => {
  const culledNodes = useMemo(() => {
    if (!enabled) {
      return nodes;
    }

    return filterNodesInViewport(nodes, viewport, width, height);
  }, [enabled, height, nodes, viewport, width]);

  const culledNodeIdSet = useMemo(() => new Set(culledNodes.map((node) => node.id)), [culledNodes]);

  const culledEdges = useMemo(() => {
    if (!enabled) {
      return edges;
    }

    return filterEdgesInViewport(edges, culledNodeIdSet, viewport, width, height);
  }, [culledNodeIdSet, edges, enabled, height, viewport, width]);

  return { culledEdges, culledNodes };
};
