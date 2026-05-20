import { SelectionMode } from '@graph-render/types/react';
import { useCallback, useState } from 'react';

import type { SelectionBox } from '../../models/domain';
import type { UseGraphPointerInteractionsOptions } from '../../models/hookContracts';
import { getRelativeSvgPoint } from '../../utils/pointer';
import { getMarqueeSelection } from '../../utils/selection';
import { useLatestRef } from '../useLatestRef';
import { useSelectionBoxScheduler } from '../useSelectionBoxScheduler';

type UseGraphMarqueeGestureOptions = Pick<
  UseGraphPointerInteractionsOptions,
  | 'marqueeSelectionEnabled'
  | 'positionedEdges'
  | 'positionedNodes'
  | 'selectionMode'
  | 'svgRef'
  | 'updateSelection'
  | 'viewportRef'
>;

export const useGraphMarqueeGesture = ({
  marqueeSelectionEnabled,
  positionedEdges,
  positionedNodes,
  selectionMode,
  svgRef,
  updateSelection,
  viewportRef,
}: UseGraphMarqueeGestureOptions) => {
  const positionedNodesRef = useLatestRef(positionedNodes);
  const positionedEdgesRef = useLatestRef(positionedEdges);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const {
    cancelSelectionBoxUpdate,
    pendingSelectionBoxRef,
    scheduleSelectionBoxUpdate,
    selectionBoxFrameRef,
  } = useSelectionBoxScheduler(setSelectionBox);

  const tryStartMarquee = useCallback(
    (event: React.PointerEvent<SVGSVGElement>, isInteractiveTarget: boolean): boolean => {
      if (
        isInteractiveTarget ||
        selectionMode !== SelectionMode.Multiple ||
        !marqueeSelectionEnabled ||
        !event.shiftKey
      ) {
        return false;
      }

      const point = getRelativeSvgPoint(svgRef.current, event.clientX, event.clientY);
      const nextSelectionBox = { startX: point.x, startY: point.y, endX: point.x, endY: point.y };
      pendingSelectionBoxRef.current = nextSelectionBox;
      setSelectionBox(nextSelectionBox);
      return true;
    },
    [marqueeSelectionEnabled, pendingSelectionBoxRef, selectionMode, svgRef]
  );

  const handleMarqueeMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>): boolean => {
      const activeSelectionBox = pendingSelectionBoxRef.current ?? selectionBox;
      if (!activeSelectionBox) {
        return false;
      }

      const point = getRelativeSvgPoint(svgRef.current, event.clientX, event.clientY);
      scheduleSelectionBoxUpdate({
        startX: activeSelectionBox.startX,
        startY: activeSelectionBox.startY,
        endX: point.x,
        endY: point.y,
      });
      return true;
    },
    [pendingSelectionBoxRef, scheduleSelectionBoxUpdate, selectionBox, svgRef]
  );

  const finalizeMarquee = useCallback((): void => {
    const latestSelectionBox = pendingSelectionBoxRef.current ?? selectionBox;
    if (!latestSelectionBox) {
      return;
    }

    if (selectionBoxFrameRef.current != null) {
      cancelAnimationFrame(selectionBoxFrameRef.current);
      selectionBoxFrameRef.current = null;
    }

    const { nodeIds, edgeIds } = getMarqueeSelection(
      latestSelectionBox,
      viewportRef.current,
      positionedNodesRef.current,
      positionedEdgesRef.current
    );
    updateSelection((current) => ({
      nodeIds: [...new Set([...current.nodeIds, ...nodeIds])],
      edgeIds: [...new Set([...current.edgeIds, ...edgeIds])],
    }));
    setSelectionBox(null);
    pendingSelectionBoxRef.current = null;
  }, [
    pendingSelectionBoxRef,
    positionedEdgesRef,
    positionedNodesRef,
    selectionBox,
    selectionBoxFrameRef,
    updateSelection,
    viewportRef,
  ]);

  const cancelMarquee = useCallback(() => {
    cancelSelectionBoxUpdate();
    setSelectionBox(null);
    pendingSelectionBoxRef.current = null;
  }, [cancelSelectionBoxUpdate, pendingSelectionBoxRef]);

  return {
    cancelMarquee,
    finalizeMarquee,
    handleMarqueeMove,
    selectionBox,
    tryStartMarquee,
  };
};
