import { useMemo, useState } from 'react';
import type { PositionedEdge, EdgeId } from '@graph-render/types';
import { traverseHighlightedPath } from '../utils/pathHighlight';
import type { FocusedPath } from '../utils/pathHighlight';
import { extractPathKeysFromNodes } from '../utils/pathKeys';
import {
  buildEdgeById,
  buildEdgesByNodeId,
  buildIncomingEdgesByTarget,
  buildNodePositionMap,
} from '../utils/graphHoverMaps';
import type { PositionedHoverNode } from '../utils/graphHoverMaps';
import { buildHoveredNodeStates, getHighlightedEdgeIds } from '../utils/graphHoverState';

export function useGraphHover(
  positionedNodes: PositionedHoverNode[],
  positionedEdges: PositionedEdge[],
  hoverHighlight: boolean
) {
  const [hoveredEdgeId, setHoveredEdgeId] = useState<EdgeId | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [focusedPath, setFocusedPath] = useState<FocusedPath | null>(null);
  const edgeById = useMemo(() => buildEdgeById(positionedEdges), [positionedEdges]);
  const edgesByNodeId = useMemo(() => buildEdgesByNodeId(positionedEdges), [positionedEdges]);
  const nodePos = useMemo(() => buildNodePositionMap(positionedNodes), [positionedNodes]);

  const pathKeysByNode = useMemo(
    () => extractPathKeysFromNodes(positionedNodes),
    [positionedNodes]
  );

  const incomingEdgesByTarget = useMemo(() => {
    return buildIncomingEdgesByTarget(positionedEdges, nodePos);
  }, [positionedEdges, nodePos]);

  const pathHighlight = useMemo(() => {
    if (!focusedPath) return null;

    return traverseHighlightedPath({
      startNodeId: focusedPath.nodeId,
      sourceIndex: focusedPath.sourceIndex,
      pathKey: focusedPath.pathKey,
      incomingEdgesByTarget,
      pathKeysByNode,
    });
  }, [focusedPath, incomingEdgesByTarget, pathKeysByNode]);

  const hoveredNodeStates = useMemo(() => {
    return buildHoveredNodeStates({
      hoverHighlight,
      focusedPath,
      hoveredEdgeId,
      hoveredNodeId,
      edgeById,
      edgesByNodeId,
      pathHighlight,
    });
  }, [
    edgeById,
    edgesByNodeId,
    hoverHighlight,
    hoveredEdgeId,
    hoveredNodeId,
    pathHighlight,
    focusedPath,
  ]);

  const edgesForRender = useMemo(() => {
    const highlightIds = getHighlightedEdgeIds(
      hoverHighlight,
      focusedPath,
      hoveredEdgeId,
      hoveredNodeId,
      edgesByNodeId,
      pathHighlight
    );

    if (!highlightIds.size) return positionedEdges;

    const front: PositionedEdge[] = [];
    const back: PositionedEdge[] = [];
    positionedEdges.forEach((e) => {
      if (highlightIds.has(e.id)) front.push(e);
      else back.push(e);
    });
    return [...back, ...front];
  }, [
    edgesByNodeId,
    hoverHighlight,
    hoveredEdgeId,
    hoveredNodeId,
    positionedEdges,
    pathHighlight,
    focusedPath,
  ]);

  return {
    hoveredEdgeId,
    setHoveredEdgeId,
    hoveredNodeId,
    setHoveredNodeId,
    focusedPath,
    setFocusedPath,
    pathHighlight,
    hoveredNodeStates,
    edgesForRender,
  };
}
