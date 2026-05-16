import type { StageBounds, StageViewportResult } from '@graph-render/types';
import { VerticalStagePosition } from '@graph-render/types';

import {
  NAVIGATION_MAX_ZOOM,
  NAVIGATION_MIN_ZOOM,
  NAVIGATION_STAGE_MIN_HEIGHT,
  NAVIGATION_STAGE_MIN_WIDTH,
  NAVIGATION_STAGE_PADDING_X,
  NAVIGATION_STAGE_PADDING_Y,
} from '../constants/stageNavigation';

/**
 * @param targetWorldHeight - optional world-space height to fit into the viewport instead of the
 *   full stage bounds height. Use this to zoom in closer, e.g. to show only a few items at once.
 *   When provided the vertical axis zoom is computed as `viewportHeight / targetWorldHeight`
 *   (still clamped to min/max zoom).
 */
export function getStageViewport(
  bounds: StageBounds,
  width: number,
  height: number,
  verticalPosition: VerticalStagePosition = VerticalStagePosition.Top,
  targetWorldHeight?: number
): StageViewportResult {
  const targetWidth = Math.max(
    bounds.width + NAVIGATION_STAGE_PADDING_X * 2,
    NAVIGATION_STAGE_MIN_WIDTH
  );
  const targetHeight =
    targetWorldHeight !== undefined
      ? targetWorldHeight
      : Math.max(bounds.height + NAVIGATION_STAGE_PADDING_Y * 2, NAVIGATION_STAGE_MIN_HEIGHT);
  const zoom = Math.min(
    NAVIGATION_MAX_ZOOM,
    Math.max(NAVIGATION_MIN_ZOOM, Math.min(width / targetWidth, height / targetHeight))
  );

  const visibleWorldHeight = height / zoom;
  const minTop = bounds.minY - NAVIGATION_STAGE_PADDING_Y;
  const maxTop = bounds.maxY + NAVIGATION_STAGE_PADDING_Y - visibleWorldHeight;
  const canPageVertically = maxTop > minTop + 1;
  const centeredTop = bounds.minY + bounds.height / 2 - visibleWorldHeight / 2;
  const topWorld =
    !canPageVertically || verticalPosition === VerticalStagePosition.Center
      ? centeredTop
      : verticalPosition === VerticalStagePosition.Bottom
        ? maxTop
        : minTop;

  return {
    canPageVertically,
    viewport: {
      zoom,
      x: (width - bounds.width * zoom) / 2 - bounds.minX * zoom,
      y: -topWorld * zoom,
    },
  };
}
