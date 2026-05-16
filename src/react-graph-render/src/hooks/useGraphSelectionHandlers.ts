import type { PositionedEdge, PositionedNode } from '@graph-render/types';
import { SelectionMode } from '@graph-render/types';
import { useCallback } from 'react';

import type { UseGraphSelectionHandlersOptions } from '../models/hooks';
import { toggleId } from '../utils/selection';

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
        edgeIds: selectionMode === SelectionMode.Single ? [] : current.edgeIds,
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
        nodeIds: selectionMode === SelectionMode.Single ? [] : current.nodeIds,
        edgeIds: toggleId(current.edgeIds, edge.id, selectionMode),
      }));
      onEdgeClick?.(edge);
    },
    [edgeSelectionEnabled, onEdgeClick, selectionMode, updateSelection]
  );

  return { handleEdgeSelection, handleNodeSelection };
};
