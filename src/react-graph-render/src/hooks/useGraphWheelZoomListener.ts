import type { GraphViewport } from '@graph-render/types/react';
import { useEffect } from 'react';

import type { UseGraphWheelZoomOptions } from '../models/hookContracts';
import { getRelativeSvgPoint } from '../utils/pointer';
import { clampViewportTranslation, clampZoom } from '../utils/viewport';
import { createViewportBatcher } from '../utils/viewportBatch';

/** Native wheel listener with `{ passive: false }` so zoom can call preventDefault without React's wheel quirks. */
export const useGraphWheelZoomListener = ({
  getViewportDimensions,
  safeMaxZoom,
  safeMinZoom,
  svgRef,
  translateExtent,
  updateViewport,
  viewportRef,
  zoomEnabled,
  zoomStep,
}: UseGraphWheelZoomOptions): void => {
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !zoomEnabled) {
      return;
    }

    const batcher = createViewportBatcher(updateViewport);

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const pointer = getRelativeSvgPoint(svg, event.clientX, event.clientY);
      const current = viewportRef.current;
      const worldX = (pointer.x - current.x) / current.zoom;
      const worldY = (pointer.y - current.y) / current.zoom;
      const zoom = clampZoom(
        current.zoom + (event.deltaY < 0 ? zoomStep : -zoomStep),
        safeMinZoom,
        safeMaxZoom
      );
      let next: GraphViewport = {
        zoom,
        x: pointer.x - worldX * zoom,
        y: pointer.y - worldY * zoom,
      };

      if (translateExtent) {
        const { width, height } = getViewportDimensions();
        next = clampViewportTranslation(next, translateExtent, width, height);
      }

      batcher.schedule(next, () => viewportRef.current);
    };

    svg.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      batcher.cancel();
      svg.removeEventListener('wheel', handleWheel);
    };
  }, [
    getViewportDimensions,
    safeMaxZoom,
    safeMinZoom,
    svgRef,
    translateExtent,
    updateViewport,
    viewportRef,
    zoomEnabled,
    zoomStep,
  ]);
};
