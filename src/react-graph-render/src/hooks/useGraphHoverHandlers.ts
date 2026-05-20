import type { PositionedNode } from '@graph-render/types';
import { GraphHoverTrigger } from '@graph-render/types/react';
import { useCallback, useRef } from 'react';

import type { UseGraphHoverHandlersOptions } from '../models/hookContracts';
import { useLatestRef } from './useLatestRef';

export const useGraphHoverHandlers = ({
  hoverHighlight,
  onEdgeHoverChange,
  onNodeHoverChange,
  positionedEdgeMap,
  positionedNodeMap,
  selection,
  setFocusedPath,
  setHoveredEdgeId,
  setHoveredNodeId,
  viewport,
}: UseGraphHoverHandlersOptions) => {
  const hoveredNodeIdRef = useRef<string | null>(null);
  const onNodeHoverChangeRef = useLatestRef(onNodeHoverChange);
  const onEdgeHoverChangeRef = useLatestRef(onEdgeHoverChange);
  // Keep latest selection and viewport in refs so hover callbacks always read
  // the current values without being recreated on every pan/zoom interaction.
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  const emitNodeHover = useCallback(
    (
      node: PositionedNode,
      hovered: boolean,
      trigger: GraphHoverTrigger = GraphHoverTrigger.Pointer
    ) => {
      onNodeHoverChangeRef.current?.(node, hovered, {
        viewport: viewportRef.current,
        selection: selectionRef.current,
        trigger,
      });
    },
    [onNodeHoverChangeRef]
  );

  const handleNodeMouseEnter = useCallback(
    (nodeId: string) => {
      hoveredNodeIdRef.current = nodeId;
      setHoveredNodeId(nodeId);
      const node = positionedNodeMap.get(nodeId);
      if (node) emitNodeHover(node, true);
    },
    [emitNodeHover, positionedNodeMap, setHoveredNodeId]
  );

  const handleNodeMouseLeave = useCallback(() => {
    const currentHoveredId = hoveredNodeIdRef.current;
    if (currentHoveredId) {
      const node = positionedNodeMap.get(currentHoveredId);
      if (node) emitNodeHover(node, false);
    }
    hoveredNodeIdRef.current = null;
    setHoveredNodeId(null);
    setFocusedPath(null);
  }, [emitNodeHover, positionedNodeMap, setFocusedPath, setHoveredNodeId]);

  const handlePathHover = useCallback(
    (nodeId: string, sourceIndex: number, pathKey?: string) => {
      setFocusedPath({ nodeId, sourceIndex, pathKey });
      const node = positionedNodeMap.get(nodeId);
      if (node) emitNodeHover(node, true, GraphHoverTrigger.Path);
    },
    [emitNodeHover, positionedNodeMap, setFocusedPath]
  );

  const handlePathLeave = useCallback(() => setFocusedPath(null), [setFocusedPath]);

  const handleEdgeHoverChange = useCallback(
    (edgeId: string, isHovered: boolean) => {
      const edge = positionedEdgeMap.get(edgeId);
      if (edge)
        onEdgeHoverChangeRef.current?.(edge, isHovered, {
          viewport: viewportRef.current,
          selection: selectionRef.current,
          trigger: GraphHoverTrigger.Pointer,
        });

      if (!hoverHighlight) return;

      setHoveredEdgeId(isHovered ? edgeId : null);
      if (isHovered) {
        hoveredNodeIdRef.current = null;
        setHoveredNodeId(null);
      }
    },
    [hoverHighlight, onEdgeHoverChangeRef, positionedEdgeMap, setHoveredEdgeId, setHoveredNodeId]
  );

  return {
    handleEdgeHoverChange,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    handlePathHover,
    handlePathLeave,
  };
};
