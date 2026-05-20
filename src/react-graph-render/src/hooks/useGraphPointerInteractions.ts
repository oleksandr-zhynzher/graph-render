import { useCallback, useEffect, useRef } from 'react';

import type { PointerState } from '../models/domain';
import type { UseGraphPointerInteractionsOptions } from '../models/hookContracts';
import { releasePointerCaptureIfAvailable } from '../utils/pointerCapture';
import { useGraphMarqueeGesture } from './pointer/useGraphMarqueeGesture';
import { useGraphPanGesture } from './pointer/useGraphPanGesture';
import { useGraphPinchGesture } from './pointer/useGraphPinchGesture';
import { useGraphViewportCommit } from './pointer/useGraphViewportCommit';

export const useGraphPointerInteractions = (options: UseGraphPointerInteractionsOptions) => {
  const activePointersRef = useRef<Map<number, PointerState>>(new Map());
  const { cancelViewport, commitViewport, flushViewport } = useGraphViewportCommit(options);

  const { cancelMarquee, finalizeMarquee, handleMarqueeMove, selectionBox, tryStartMarquee } =
    useGraphMarqueeGesture(options);
  const { cancelPan, endPan, handlePanMove, isDragging, tryStartPan } = useGraphPanGesture({
    ...options,
    commitViewport,
  });
  const { cancelPinch, handlePinchMove, releaseTouchPointer, trackTouchPointer, tryStartPinch } =
    useGraphPinchGesture({ ...options, activePointersRef, commitViewport });

  useEffect(() => {
    const activePointers = activePointersRef.current;

    return () => {
      cancelViewport();
      cancelMarquee();
      cancelPan();
      cancelPinch();
      activePointers.clear();
    };
  }, [cancelMarquee, cancelPan, cancelPinch, cancelViewport]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const target = event.target as Element;
      const isInteractiveTarget = Boolean(
        target.closest('[data-graph-node-interactive="true"], [data-graph-edge-interactive="true"]')
      );

      if (tryStartMarquee(event, isInteractiveTarget)) {
        endPan();
        return;
      }

      if (event.pointerType === 'touch') {
        trackTouchPointer(event);
        if (tryStartPinch(event)) {
          endPan();
          return;
        }
      }

      tryStartPan(event, isInteractiveTarget);
    },
    [endPan, tryStartMarquee, tryStartPan, tryStartPinch, trackTouchPointer]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (handlePinchMove(event)) {
        return;
      }
      if (handleMarqueeMove(event)) {
        return;
      }
      handlePanMove(event);
    },
    [handleMarqueeMove, handlePanMove, handlePinchMove]
  );

  const resetPointerInteraction = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      flushViewport();
      if (event.pointerType === 'touch') {
        releaseTouchPointer(event.pointerId);
      }
      finalizeMarquee();
      endPan();
      releasePointerCaptureIfAvailable(event.target as Element, event.pointerId);
    },
    [endPan, finalizeMarquee, flushViewport, releaseTouchPointer]
  );

  return {
    handlePointerCancel: resetPointerInteraction,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp: resetPointerInteraction,
    isDragging,
    selectionBox,
  };
};
