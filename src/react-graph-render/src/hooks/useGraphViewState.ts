import type { GraphHandle, GraphSelection, GraphViewport } from '@graph-render/types/react';
import { useCallback, useMemo, useRef, useState } from 'react';

import { DEFAULT_VIEWPORT } from '../constants/graph';
import type { UseGraphViewStateOptions, UseGraphViewStateResult } from '../models/hookContracts';
import { normalizeViewport } from '../utils/viewport';

export const useGraphViewState = ({
  controlledViewport,
  defaultViewport,
  safeMinZoom,
  safeMaxZoom,
  onViewportChange,
  selectedNodeIds,
  selectedEdgeIds,
  defaultSelectedNodeIds,
  defaultSelectedEdgeIds,
  onSelectionChange,
  controlledFocusedNodeId,
  defaultFocusedNodeId,
  onFocusedNodeChange,
}: UseGraphViewStateOptions): UseGraphViewStateResult => {
  const [internalViewport, setInternalViewport] = useState<GraphViewport>(() =>
    normalizeViewport({ ...DEFAULT_VIEWPORT, ...defaultViewport }, safeMinZoom, safeMaxZoom)
  );
  const [internalSelection, setInternalSelection] = useState<GraphSelection>({
    nodeIds: defaultSelectedNodeIds ?? [],
    edgeIds: defaultSelectedEdgeIds ?? [],
  });
  const [internalFocusedNodeId, setInternalFocusedNodeId] = useState<string | null>(
    defaultFocusedNodeId
  );

  const viewport = useMemo(
    () => normalizeViewport(controlledViewport ?? internalViewport, safeMinZoom, safeMaxZoom),
    [controlledViewport, internalViewport, safeMaxZoom, safeMinZoom]
  );
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

  const selection = useMemo<GraphSelection>(
    () => ({
      nodeIds: selectedNodeIds ?? internalSelection.nodeIds,
      edgeIds: selectedEdgeIds ?? internalSelection.edgeIds,
    }),
    [selectedNodeIds, selectedEdgeIds, internalSelection]
  );
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  const focusedNodeId =
    controlledFocusedNodeId === undefined ? internalFocusedNodeId : controlledFocusedNodeId;

  const updateViewport = useCallback<GraphHandle['setViewport']>(
    (next) => {
      const current = viewportRef.current;
      const resolved = typeof next === 'function' ? next(current) : next;
      const normalized = normalizeViewport({ ...current, ...resolved }, safeMinZoom, safeMaxZoom);

      if (!controlledViewport) {
        setInternalViewport(normalized);
      }
      onViewportChangeRef.current?.(normalized);
    },
    [controlledViewport, safeMaxZoom, safeMinZoom]
  );

  const updateSelection = useCallback(
    (next: GraphSelection | ((current: GraphSelection) => GraphSelection)) => {
      const current = selectionRef.current;
      const resolved = typeof next === 'function' ? next(current) : next;
      if (selectedNodeIds == null || selectedEdgeIds == null) {
        setInternalSelection((previous) => ({
          nodeIds: selectedNodeIds == null ? resolved.nodeIds : previous.nodeIds,
          edgeIds: selectedEdgeIds == null ? resolved.edgeIds : previous.edgeIds,
        }));
      }
      onSelectionChange?.(resolved);
    },
    [onSelectionChange, selectedEdgeIds, selectedNodeIds]
  );

  const updateFocusedNode = useCallback(
    (nodeId: string | null) => {
      if (controlledFocusedNodeId === undefined) {
        setInternalFocusedNodeId(nodeId);
      }
      onFocusedNodeChange?.(nodeId);
    },
    [controlledFocusedNodeId, onFocusedNodeChange]
  );

  return {
    viewport,
    viewportRef,
    selection,
    selectionRef,
    focusedNodeId,
    updateViewport,
    updateSelection,
    updateFocusedNode,
  };
};
