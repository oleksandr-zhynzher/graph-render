import type { DragState } from '@graph-render/types';
import { SelectionMode } from '@graph-render/types';
import { useCallback, useRef, useState } from 'react';

import type { UseGraphPointerInteractionsOptions } from '../models/hooks';
import {
  getPointerDistance,
  getPointerMidpoint,
  getRelativeSvgPoint,
  type PinchState,
  type PointerState,
  type SelectionBox,
} from '../utils/pointer';
import { getMarqueeSelection } from '../utils/selection';
import { clampViewportTranslation, clampZoom } from '../utils/viewport';

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

export const useGraphPointerInteractions = ({
  getViewportDimensions,
  marqueeSelectionEnabled,
  panEnabled,
  pinchZoomEnabled,
  positionedEdges,
  positionedNodes,
  safeMaxZoom,
  safeMinZoom,
  selectionMode,
  svgRef,
  translateExtent,
  updateSelection,
  updateViewport,
  viewport,
  zoomEnabled,
}: UseGraphPointerInteractionsOptions) => {
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<Mutable<DragState>>({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  const activePointersRef = useRef<Map<number, PointerState>>(new Map());
  const pinchRef = useRef<Mutable<PinchState>>({
    active: false,
    startDistance: 0,
    startZoom: 1,
    worldX: 0,
    worldY: 0,
  });
  const handlePointerDown = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const target = event.target as Element;
      const isInteractiveTarget = Boolean(
        target.closest('[data-graph-node-interactive="true"], [data-graph-edge-interactive="true"]')
      );
      const point = getRelativeSvgPoint(svgRef.current, event.clientX, event.clientY);
      if (
        !isInteractiveTarget &&
        selectionMode === SelectionMode.Multiple &&
        marqueeSelectionEnabled &&
        event.shiftKey
      ) {
        setSelectionBox({ startX: point.x, startY: point.y, endX: point.x, endY: point.y });
        dragRef.current.active = false;
        return;
      }

      if (event.pointerType === 'touch') {
        activePointersRef.current.set(event.pointerId, point);
        if (pinchZoomEnabled && zoomEnabled && activePointersRef.current.size === 2) {
          const [first, second] = [...activePointersRef.current.values()];
          if (!first || !second) {
            return;
          }
          const midpoint = getPointerMidpoint(first, second);
          pinchRef.current = {
            active: true,
            startDistance: getPointerDistance(first, second),
            startZoom: viewport.zoom,
            worldX: (midpoint.x - viewport.x) / viewport.zoom,
            worldY: (midpoint.y - viewport.y) / viewport.zoom,
          };
          dragRef.current.active = false;
          target.setPointerCapture(event.pointerId);
          return;
        }
      }
      if (!panEnabled || event.button !== 0 || isInteractiveTarget) return;
      dragRef.current = {
        active: true,
        startX: point.x,
        startY: point.y,
        originX: viewport.x,
        originY: viewport.y,
      };
      setIsDragging(true);
      target.setPointerCapture(event.pointerId);
    },
    [
      marqueeSelectionEnabled,
      panEnabled,
      pinchZoomEnabled,
      selectionMode,
      svgRef,
      viewport,
      zoomEnabled,
    ]
  );
  const handlePointerMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const point = getRelativeSvgPoint(svgRef.current, event.clientX, event.clientY);
      if (event.pointerType === 'touch' && activePointersRef.current.has(event.pointerId)) {
        activePointersRef.current.set(event.pointerId, point);
        if (pinchRef.current.active && activePointersRef.current.size >= 2) {
          const [first, second] = [...activePointersRef.current.values()];
          if (!first || !second) {
            return;
          }
          const midpoint = getPointerMidpoint(first, second);
          const distance = getPointerDistance(first, second);
          const zoom = clampZoom(
            pinchRef.current.startZoom * (distance / Math.max(1, pinchRef.current.startDistance)),
            safeMinZoom,
            safeMaxZoom
          );
          let next = {
            zoom,
            x: midpoint.x - pinchRef.current.worldX * zoom,
            y: midpoint.y - pinchRef.current.worldY * zoom,
          };
          if (translateExtent) {
            const { width, height } = getViewportDimensions();
            next = clampViewportTranslation(next, translateExtent, width, height);
          }
          updateViewport(next);
          return;
        }
      }
      if (selectionBox) {
        setSelectionBox((current) =>
          current ? { ...current, endX: point.x, endY: point.y } : current
        );
        return;
      }
      if (!panEnabled || !dragRef.current.active) return;
      updateViewport((current) => {
        const next = {
          ...current,
          x: dragRef.current.originX + point.x - dragRef.current.startX,
          y: dragRef.current.originY + point.y - dragRef.current.startY,
        };
        if (!translateExtent) return next;
        const { width, height } = getViewportDimensions();
        return clampViewportTranslation(next, translateExtent, width, height);
      });
    },
    [
      getViewportDimensions,
      panEnabled,
      safeMaxZoom,
      safeMinZoom,
      selectionBox,
      svgRef,
      translateExtent,
      updateViewport,
    ]
  );
  const handlePointerUp = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      activePointersRef.current.delete(event.pointerId);
      if (activePointersRef.current.size < 2) pinchRef.current.active = false;
      if (selectionBox) {
        const { nodeIds, edgeIds } = getMarqueeSelection(
          selectionBox,
          viewport,
          positionedNodes,
          positionedEdges
        );
        updateSelection((current) => ({
          nodeIds: [...new Set([...current.nodeIds, ...nodeIds])],
          edgeIds: [...new Set([...current.edgeIds, ...edgeIds])],
        }));
        setSelectionBox(null);
      }
      dragRef.current.active = false;
      setIsDragging(false);
      const el = event.target as Element;
      if (el.hasPointerCapture(event.pointerId)) {
        el.releasePointerCapture(event.pointerId);
      }
    },
    [positionedEdges, positionedNodes, selectionBox, updateSelection, viewport]
  );
  return { handlePointerDown, handlePointerMove, handlePointerUp, isDragging, selectionBox };
};
