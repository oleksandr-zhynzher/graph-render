import type { PositionedEdge, PositionedNode } from '@graph-render/types';
import { SelectionMode } from '@graph-render/types/react';
import { useCallback } from 'react';

import type { UseGraphSelectionHandlersOptions } from '../models/hookContracts';
import { toggleId } from '../utils/selection';
import { useLatestRef } from './useLatestRef';

export const useGraphSelectionHandlers = ({
  edgeSelectionEnabled,
  nodeSelectionEnabled,
  onEdgeClick,
  onNodeClick,
  selectionMode,
  updateFocusedNode,
  updateSelection,
}: UseGraphSelectionHandlersOptions) => {
  const onNodeClickRef = useLatestRef(onNodeClick);
  const onEdgeClickRef = useLatestRef(onEdgeClick);

  const handleNodeSelection = useCallback(
    (node: PositionedNode) => {
      if (!nodeSelectionEnabled) {
        updateFocusedNode(node.id);
        onNodeClickRef.current?.(node);
        return;
      }

      updateSelection((current) => ({
        nodeIds: toggleId(current.nodeIds, node.id, selectionMode),
        edgeIds: selectionMode === SelectionMode.Single ? [] : current.edgeIds,
      }));
      updateFocusedNode(node.id);
      onNodeClickRef.current?.(node);
    },
    [nodeSelectionEnabled, onNodeClickRef, selectionMode, updateFocusedNode, updateSelection]
  );

  const handleEdgeSelection = useCallback(
    (edge: PositionedEdge) => {
      if (!edgeSelectionEnabled) {
        onEdgeClickRef.current?.(edge);
        return;
      }

      updateSelection((current) => ({
        nodeIds: selectionMode === SelectionMode.Single ? [] : current.nodeIds,
        edgeIds: toggleId(current.edgeIds, edge.id, selectionMode),
      }));
      onEdgeClickRef.current?.(edge);
    },
    [edgeSelectionEnabled, onEdgeClickRef, selectionMode, updateSelection]
  );

  return { handleEdgeSelection, handleNodeSelection };
};
