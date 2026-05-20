import type { GraphViewport } from '@graph-render/types/react';

type ViewportUpdater = (
  next:
    | Partial<GraphViewport>
    | GraphViewport
    | ((current: GraphViewport) => Partial<GraphViewport> | GraphViewport)
) => void;

/** Coalesces viewport commits to one React update per animation frame during gestures. */
export const createViewportBatcher = (updateViewport: ViewportUpdater) => {
  let frameId: number | null = null;
  let pending: GraphViewport | null = null;

  const flush = () => {
    frameId = null;
    if (pending) {
      const next = pending;
      pending = null;
      updateViewport(next);
    }
  };

  const schedule = (
    next:
      | Partial<GraphViewport>
      | GraphViewport
      | ((current: GraphViewport) => Partial<GraphViewport> | GraphViewport),
    getCurrent: () => GraphViewport
  ) => {
    const current = pending ?? getCurrent();
    const resolved = typeof next === 'function' ? next(current) : next;
    pending = { ...current, ...resolved };

    if (frameId == null) {
      frameId = requestAnimationFrame(flush);
    }
  };

  const cancel = () => {
    if (frameId != null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
    pending = null;
  };

  const flushNow = () => {
    if (frameId != null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
    flush();
  };

  return { schedule, cancel, flushNow };
};
