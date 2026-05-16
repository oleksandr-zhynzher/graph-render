import { useCallback } from 'react';
import { getRelativeSvgPoint } from '../utils/pointer';
import { clampViewportTranslation, clampZoom } from '../utils/viewport';
import type { UseGraphWheelZoomOptions } from '../models/hooks';

export const useGraphWheelZoom = ({
  getViewportDimensions,
  safeMaxZoom,
  safeMinZoom,
  svgRef,
  translateExtent,
  updateViewport,
  viewportRef,
  zoomEnabled,
  zoomStep,
}: UseGraphWheelZoomOptions) => {
  return useCallback(
    (event: React.WheelEvent<SVGSVGElement>) => {
      if (!zoomEnabled || !svgRef.current) return;

      event.preventDefault();
      const pointer = getRelativeSvgPoint(svgRef.current, event.clientX, event.clientY);
      const current = viewportRef.current;
      const worldX = (pointer.x - current.x) / current.zoom;
      const worldY = (pointer.y - current.y) / current.zoom;
      const zoom = clampZoom(
        current.zoom + (event.deltaY < 0 ? zoomStep : -zoomStep),
        safeMinZoom,
        safeMaxZoom
      );
      let next = { zoom, x: pointer.x - worldX * zoom, y: pointer.y - worldY * zoom };

      if (translateExtent) {
        const { width, height } = getViewportDimensions();
        next = clampViewportTranslation(next, translateExtent, width, height);
      }
      updateViewport(next);
    },
    [
      getViewportDimensions,
      safeMaxZoom,
      safeMinZoom,
      svgRef,
      translateExtent,
      updateViewport,
      viewportRef,
      zoomEnabled,
      zoomStep,
    ]
  );
};
