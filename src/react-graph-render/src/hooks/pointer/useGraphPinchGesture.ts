import type { GraphViewport } from '@graph-render/types/react';
import { useCallback, useRef } from 'react';

import type { PinchState, PointerState } from '../../models/domain';
import type { UseGraphPointerInteractionsOptions } from '../../models/hookContracts';
import { getPointerDistance, getPointerMidpoint, getRelativeSvgPoint } from '../../utils/pointer';
import { setPointerCaptureIfAvailable } from '../../utils/pointerCapture';
import { clampViewportTranslation, clampZoom } from '../../utils/viewport';
import { getTwoActivePointers } from './pointerGestureUtils';

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

interface UseGraphPinchGestureOptions extends Pick<
  UseGraphPointerInteractionsOptions,
  | 'getViewportDimensions'
  | 'pinchZoomEnabled'
  | 'safeMaxZoom'
  | 'safeMinZoom'
  | 'svgRef'
  | 'translateExtent'
  | 'viewportRef'
  | 'zoomEnabled'
> {
  readonly activePointersRef: React.RefObject<Map<number, PointerState>>;
  readonly commitViewport: (
    next:
      | Partial<GraphViewport>
      | GraphViewport
      | ((current: GraphViewport) => Partial<GraphViewport> | GraphViewport)
  ) => void;
}

export const useGraphPinchGesture = ({
  activePointersRef,
  commitViewport,
  getViewportDimensions,
  pinchZoomEnabled,
  safeMaxZoom,
  safeMinZoom,
  svgRef,
  translateExtent,
  viewportRef,
  zoomEnabled,
}: UseGraphPinchGestureOptions) => {
  const pinchRef = useRef<Mutable<PinchState>>({
    active: false,
    startDistance: 0,
    startZoom: 1,
    worldX: 0,
    worldY: 0,
  });

  const trackTouchPointer = useCallback(
    (event: React.PointerEvent<SVGSVGElement>): void => {
      if (event.pointerType !== 'touch') {
        return;
      }

      const point = getRelativeSvgPoint(svgRef.current, event.clientX, event.clientY);
      activePointersRef.current.set(event.pointerId, point);
    },
    [activePointersRef, svgRef]
  );

  const tryStartPinch = useCallback(
    (event: React.PointerEvent<SVGSVGElement>): boolean => {
      if (
        event.pointerType !== 'touch' ||
        !pinchZoomEnabled ||
        !zoomEnabled ||
        activePointersRef.current.size !== 2
      ) {
        return false;
      }

      const pair = getTwoActivePointers(activePointersRef.current);
      if (!pair) {
        return false;
      }

      const [first, second] = pair;
      const midpoint = getPointerMidpoint(first, second);
      const currentViewport = viewportRef.current;
      pinchRef.current = {
        active: true,
        startDistance: getPointerDistance(first, second),
        startZoom: currentViewport.zoom,
        worldX: (midpoint.x - currentViewport.x) / currentViewport.zoom,
        worldY: (midpoint.y - currentViewport.y) / currentViewport.zoom,
      };
      setPointerCaptureIfAvailable(event.target as Element, event.pointerId);
      return true;
    },
    [activePointersRef, pinchZoomEnabled, viewportRef, zoomEnabled]
  );

  const handlePinchMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>): boolean => {
      if (
        event.pointerType !== 'touch' ||
        !activePointersRef.current.has(event.pointerId) ||
        !pinchRef.current.active ||
        activePointersRef.current.size < 2
      ) {
        return false;
      }

      const point = getRelativeSvgPoint(svgRef.current, event.clientX, event.clientY);
      activePointersRef.current.set(event.pointerId, point);
      const pair = getTwoActivePointers(activePointersRef.current);
      if (!pair) {
        return false;
      }

      const [first, second] = pair;
      const midpoint = getPointerMidpoint(first, second);
      const distance = getPointerDistance(first, second);
      const zoom = clampZoom(
        pinchRef.current.startZoom * (distance / Math.max(1, pinchRef.current.startDistance)),
        safeMinZoom,
        safeMaxZoom
      );
      let next: GraphViewport = {
        zoom,
        x: midpoint.x - pinchRef.current.worldX * zoom,
        y: midpoint.y - pinchRef.current.worldY * zoom,
      };
      if (translateExtent) {
        const { width, height } = getViewportDimensions();
        next = clampViewportTranslation(next, translateExtent, width, height);
      }
      commitViewport(next);
      return true;
    },
    [
      activePointersRef,
      commitViewport,
      getViewportDimensions,
      safeMaxZoom,
      safeMinZoom,
      svgRef,
      translateExtent,
    ]
  );

  const releaseTouchPointer = useCallback(
    (pointerId: number): void => {
      activePointersRef.current.delete(pointerId);
      if (activePointersRef.current.size < 2) {
        pinchRef.current.active = false;
      }
    },
    [activePointersRef]
  );

  const cancelPinch = useCallback(() => {
    activePointersRef.current.clear();
    pinchRef.current.active = false;
  }, [activePointersRef]);

  return {
    cancelPinch,
    handlePinchMove,
    releaseTouchPointer,
    trackTouchPointer,
    tryStartPinch,
  };
};
