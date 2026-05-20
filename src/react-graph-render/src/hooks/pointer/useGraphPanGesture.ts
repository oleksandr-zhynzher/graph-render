import type { DragState, GraphViewport } from '@graph-render/types/react';
import { useCallback, useRef, useState } from 'react';

import type { UseGraphPointerInteractionsOptions } from '../../models/hookContracts';
import { getRelativeSvgPoint } from '../../utils/pointer';
import { setPointerCaptureIfAvailable } from '../../utils/pointerCapture';
import { clampViewportTranslation } from '../../utils/viewport';

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

interface UseGraphPanGestureOptions extends Pick<
  UseGraphPointerInteractionsOptions,
  'getViewportDimensions' | 'panEnabled' | 'svgRef' | 'translateExtent' | 'viewportRef'
> {
  readonly commitViewport: (
    next:
      | Partial<GraphViewport>
      | GraphViewport
      | ((current: GraphViewport) => Partial<GraphViewport> | GraphViewport)
  ) => void;
}

export const useGraphPanGesture = ({
  commitViewport,
  getViewportDimensions,
  panEnabled,
  svgRef,
  translateExtent,
  viewportRef,
}: UseGraphPanGestureOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<Mutable<DragState>>({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const tryStartPan = useCallback(
    (event: React.PointerEvent<SVGSVGElement>, isInteractiveTarget: boolean): boolean => {
      if (!panEnabled || event.button !== 0 || isInteractiveTarget) {
        return false;
      }

      const point = getRelativeSvgPoint(svgRef.current, event.clientX, event.clientY);
      const currentViewport = viewportRef.current;
      dragRef.current = {
        active: true,
        startX: point.x,
        startY: point.y,
        originX: currentViewport.x,
        originY: currentViewport.y,
      };
      setIsDragging(true);
      setPointerCaptureIfAvailable(event.target as Element, event.pointerId);
      return true;
    },
    [panEnabled, svgRef, viewportRef]
  );

  const handlePanMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>): boolean => {
      if (!panEnabled || !dragRef.current.active) {
        return false;
      }

      const point = getRelativeSvgPoint(svgRef.current, event.clientX, event.clientY);
      commitViewport((current) => {
        const next = {
          ...current,
          x: dragRef.current.originX + point.x - dragRef.current.startX,
          y: dragRef.current.originY + point.y - dragRef.current.startY,
        };
        if (!translateExtent) {
          return next;
        }
        const { width, height } = getViewportDimensions();
        return clampViewportTranslation(next, translateExtent, width, height);
      });
      return true;
    },
    [commitViewport, getViewportDimensions, panEnabled, svgRef, translateExtent]
  );

  const endPan = useCallback(() => {
    dragRef.current.active = false;
    setIsDragging(false);
  }, []);

  const cancelPan = useCallback(() => {
    dragRef.current.active = false;
    setIsDragging(false);
  }, []);

  return { cancelPan, endPan, handlePanMove, isDragging, tryStartPan };
};
