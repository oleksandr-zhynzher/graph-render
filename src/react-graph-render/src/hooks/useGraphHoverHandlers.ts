import { useCallback, useRef } from 'react';
import type { PositionedNode } from '@graph-render/types';
import type { UseGraphHoverHandlersOptions } from '../models/hooks';

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
  // Keep latest selection and viewport in refs so hover callbacks always read
  // the current values without being recreated on every pan/zoom interaction.
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  const emitNodeHover = useCallback(
    (node: PositionedNode, hovered: boolean, trigger: 'pointer' | 'path' = 'pointer') => {
      onNodeHoverChange?.(node, hovered, {
        viewport: viewportRef.current,
        selection: selectionRef.current,
        trigger,
      });
    },
    [onNodeHoverChange]
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
      if (node) emitNodeHover(node, true, 'path');
    },
    [emitNodeHover, positionedNodeMap, setFocusedPath]
  );

  const handlePathLeave = useCallback(() => setFocusedPath(null), [setFocusedPath]);

  const handleEdgeHoverChange = useCallback(
    (edgeId: string, isHovered: boolean) => {
      const edge = positionedEdgeMap.get(edgeId);
      if (edge)
        onEdgeHoverChange?.(edge, isHovered, {
          viewport: viewportRef.current,
          selection: selectionRef.current,
          trigger: 'pointer',
        });

      if (!hoverHighlight) return;

      setHoveredEdgeId(isHovered ? edgeId : null);
      if (isHovered) {
        hoveredNodeIdRef.current = null;
        setHoveredNodeId(null);
      }
    },
    [hoverHighlight, onEdgeHoverChange, positionedEdgeMap, setHoveredEdgeId, setHoveredNodeId]
  );

  return {
    handleEdgeHoverChange,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    handlePathHover,
    handlePathLeave,
  };
};
