import type { GraphSelection } from '@graph-render/types/react';
import { useEffect, useMemo, useRef } from 'react';

import type { UseGraphViewStateResult } from '../models/hookContracts';

interface VisibleEntity {
  readonly id: string;
}

interface UseGraphVisibleSelectionOptions {
  readonly focusedNodeId: string | null;
  readonly selection: GraphSelection;
  readonly selectionRef: UseGraphViewStateResult['selectionRef'];
  readonly updateFocusedNode: UseGraphViewStateResult['updateFocusedNode'];
  readonly updateSelection: UseGraphViewStateResult['updateSelection'];
  readonly visibleEdges: readonly VisibleEntity[];
  readonly visibleNodes: readonly VisibleEntity[];
}

interface UseGraphVisibleSelectionResult {
  readonly effectiveFocusedNodeId: string | null;
  readonly effectiveSelection: GraphSelection;
  readonly selectedEdgeSet: ReadonlySet<string>;
  readonly selectedNodeSet: ReadonlySet<string>;
  readonly visibleEdgeIdSet: ReadonlySet<string>;
  readonly visibleNodeIdSet: ReadonlySet<string>;
}

const selectionEquals = (left: GraphSelection, right: GraphSelection): boolean => {
  return (
    left.nodeIds.length === right.nodeIds.length &&
    left.edgeIds.length === right.edgeIds.length &&
    left.nodeIds.every((id, index) => id === right.nodeIds[index]) &&
    left.edgeIds.every((id, index) => id === right.edgeIds[index])
  );
};

export const useGraphVisibleSelection = ({
  focusedNodeId,
  selection,
  selectionRef,
  updateFocusedNode,
  updateSelection,
  visibleEdges,
  visibleNodes,
}: UseGraphVisibleSelectionOptions): UseGraphVisibleSelectionResult => {
  const visibleNodeIdSet = useMemo(
    () => new Set(visibleNodes.map((node) => node.id)),
    [visibleNodes]
  );
  const visibleEdgeIdSet = useMemo(
    () => new Set(visibleEdges.map((edge) => edge.id)),
    [visibleEdges]
  );

  const effectiveSelection = useMemo(
    () => ({
      nodeIds: selection.nodeIds.filter((nodeId) => visibleNodeIdSet.has(nodeId)),
      edgeIds: selection.edgeIds.filter((edgeId) => visibleEdgeIdSet.has(edgeId)),
    }),
    [selection.edgeIds, selection.nodeIds, visibleEdgeIdSet, visibleNodeIdSet]
  );

  const effectiveFocusedNodeId =
    focusedNodeId && visibleNodeIdSet.has(focusedNodeId) ? focusedNodeId : null;

  const selectedNodeSet = useMemo(
    () => new Set(effectiveSelection.nodeIds),
    [effectiveSelection.nodeIds]
  );
  const selectedEdgeSet = useMemo(
    () => new Set(effectiveSelection.edgeIds),
    [effectiveSelection.edgeIds]
  );

  const focusedNodeIdRef = useRef(focusedNodeId);
  focusedNodeIdRef.current = focusedNodeId;

  useEffect(() => {
    const currentSelection = selectionRef.current;
    if (currentSelection && !selectionEquals(effectiveSelection, currentSelection)) {
      updateSelection(effectiveSelection);
    }

    const currentFocusedNodeId = focusedNodeIdRef.current;
    if (currentFocusedNodeId && !visibleNodeIdSet.has(currentFocusedNodeId)) {
      updateFocusedNode(null);
    }
  }, [effectiveSelection, selectionRef, updateFocusedNode, updateSelection, visibleNodeIdSet]);

  return {
    effectiveFocusedNodeId,
    effectiveSelection,
    selectedEdgeSet,
    selectedNodeSet,
    visibleEdgeIdSet,
    visibleNodeIdSet,
  };
};
