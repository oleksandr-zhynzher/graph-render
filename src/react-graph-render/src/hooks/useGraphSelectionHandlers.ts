import { useCallback } from 'react';
import type { PositionedEdge, PositionedNode } from '@graph-render/types';
import { toggleId } from '../utils/selection';
import type { UseGraphSelectionHandlersOptions } from '../models/hooks';

export const useGraphSelectionHandlers = ({
  edgeSelectionEnabled,
  nodeSelectionEnabled,
  onEdgeClick,
  onNodeClick,
  selectionMode,
  updateFocusedNode,
  updateSelection,
}: UseGraphSelectionHandlersOptions) => {
  const handleNodeSelection = useCallback(
    (node: PositionedNode) => {
      if (!nodeSelectionEnabled) {
        updateFocusedNode(node.id);
        onNodeClick?.(node);
        return;
      }

      updateSelection((current) => ({
        nodeIds: toggleId(current.nodeIds, node.id, selectionMode),
        edgeIds: selectionMode === 'single' ? [] : current.edgeIds,
      }));
      updateFocusedNode(node.id);
      onNodeClick?.(node);
    },
    [nodeSelectionEnabled, onNodeClick, selectionMode, updateFocusedNode, updateSelection]
  );

  const handleEdgeSelection = useCallback(
    (edge: PositionedEdge) => {
      if (!edgeSelectionEnabled) {
        onEdgeClick?.(edge);
        return;
      }

      updateSelection((current) => ({
        nodeIds: selectionMode === 'single' ? [] : current.nodeIds,
        edgeIds: toggleId(current.edgeIds, edge.id, selectionMode),
      }));
      onEdgeClick?.(edge);
    },
    [edgeSelectionEnabled, onEdgeClick, selectionMode, updateSelection]
  );

  return { handleEdgeSelection, handleNodeSelection };
};
