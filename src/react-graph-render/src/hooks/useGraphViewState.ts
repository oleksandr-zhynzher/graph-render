import { useCallback, useMemo, useRef, useState } from 'react';
import {
  GraphSelection,
  GraphViewport,
  GraphProps,
  GraphHandle,
  NxGraphInput,
  PositionedNode,
  PositionedEdge,
  NodeData,
  EdgeData,
} from '@graph-render/types';
import { clampZoom } from '../utils/viewport';

const DEFAULT_VIEWPORT: GraphViewport = { x: 0, y: 0, zoom: 1 };

const normalizeViewport = (
  viewport: GraphViewport,
  minZoom: number,
  maxZoom: number
): GraphViewport => ({
  x: Number.isFinite(viewport.x) ? viewport.x : 0,
  y: Number.isFinite(viewport.y) ? viewport.y : 0,
  zoom: clampZoom(Number.isFinite(viewport.zoom) ? viewport.zoom : 1, minZoom, maxZoom),
});

interface UseGraphViewStateOptions {
  controlledViewport: GraphViewport | undefined;
  defaultViewport: Partial<GraphViewport> | undefined;
  safeMinZoom: number;
  safeMaxZoom: number;
  onViewportChange: ((viewport: GraphViewport) => void) | undefined;
  selectedNodeIds: string[] | undefined;
  selectedEdgeIds: string[] | undefined;
  defaultSelectedNodeIds: string[] | undefined;
  defaultSelectedEdgeIds: string[] | undefined;
  onSelectionChange: ((selection: GraphSelection) => void) | undefined;
  controlledFocusedNodeId: string | null | undefined;
  defaultFocusedNodeId: string | null;
  onFocusedNodeChange: ((nodeId: string | null) => void) | undefined;
}

interface UseGraphViewStateResult {
  viewport: GraphViewport;
  viewportRef: React.MutableRefObject<GraphViewport>;
  selection: GraphSelection;
  selectionRef: React.MutableRefObject<GraphSelection>;
  focusedNodeId: string | null;
  updateViewport: GraphHandle['setViewport'];
  updateSelection: (next: GraphSelection | ((current: GraphSelection) => GraphSelection)) => void;
  updateFocusedNode: (nodeId: string | null) => void;
}

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
    normalizeViewport({ ...DEFAULT_VIEWPORT, ...(defaultViewport ?? {}) }, safeMinZoom, safeMaxZoom)
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
    controlledFocusedNodeId !== undefined ? controlledFocusedNodeId : internalFocusedNodeId;

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
