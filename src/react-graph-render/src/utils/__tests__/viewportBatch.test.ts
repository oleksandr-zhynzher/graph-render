import { describe, expect, it, vi } from 'vitest';

import { createViewportBatcher } from '../viewportBatch';

describe('createViewportBatcher', () => {
  it('coalesces multiple schedules into one update per frame', async () => {
    const updateViewport = vi.fn();
    const batcher = createViewportBatcher(updateViewport);

    batcher.schedule({ x: 1 }, () => ({ x: 0, y: 0, zoom: 1 }));
    batcher.schedule({ x: 2 }, () => ({ x: 0, y: 0, zoom: 1 }));
    batcher.schedule({ x: 3 }, () => ({ x: 0, y: 0, zoom: 1 }));

    expect(updateViewport).not.toHaveBeenCalled();

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        expect(updateViewport).toHaveBeenCalledTimes(1);
        expect(updateViewport).toHaveBeenCalledWith({ x: 3, y: 0, zoom: 1 });
        resolve();
      });
    });
  });

  it('flushNow commits immediately', () => {
    const updateViewport = vi.fn();
    const batcher = createViewportBatcher(updateViewport);

    batcher.schedule({ zoom: 2 }, () => ({ x: 0, y: 0, zoom: 1 }));
    batcher.flushNow();

    expect(updateViewport).toHaveBeenCalledWith({ x: 0, y: 0, zoom: 2 });
  });
});
