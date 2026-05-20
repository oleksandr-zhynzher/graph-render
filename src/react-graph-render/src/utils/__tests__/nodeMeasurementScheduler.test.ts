import { afterEach, describe, expect, it, vi } from 'vitest';

import { createNodeMeasurementScheduler } from '../nodeMeasurementScheduler';

describe('nodeMeasurementScheduler', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('batches measurements into a single animation frame', async () => {
    const onMeasureA = vi.fn();
    const onMeasureB = vi.fn();
    const elementA = {
      getBBox: () => ({ width: 10, height: 20, x: 0, y: 0 }),
    } as unknown as SVGGElement;
    const elementB = {
      getBBox: () => ({ width: 30, height: 40, x: 0, y: 0 }),
    } as unknown as SVGGElement;
    const scheduler = createNodeMeasurementScheduler();

    scheduler.schedule('a', elementA, 10, 20, onMeasureA);
    scheduler.schedule('b', elementB, 30, 40, onMeasureB);

    expect(onMeasureA).not.toHaveBeenCalled();
    expect(onMeasureB).not.toHaveBeenCalled();

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        expect(onMeasureA).toHaveBeenCalledWith({ width: 10, height: 20 });
        expect(onMeasureB).toHaveBeenCalledWith({ width: 30, height: 40 });
        resolve();
      });
    });
  });

  it('cancels a pending measurement for a node', async () => {
    const onMeasure = vi.fn();
    const element = {
      getBBox: () => ({ width: 5, height: 5, x: 0, y: 0 }),
    } as unknown as SVGGElement;
    const scheduler = createNodeMeasurementScheduler();

    scheduler.schedule('a', element, 5, 5, onMeasure);
    scheduler.cancel('a');

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        expect(onMeasure).not.toHaveBeenCalled();
        resolve();
      });
    });
  });

  it('keeps separate scheduler instances isolated for matching node ids', async () => {
    const onMeasureA = vi.fn();
    const onMeasureB = vi.fn();
    const elementA = {
      getBBox: () => ({ width: 10, height: 20, x: 0, y: 0 }),
    } as unknown as SVGGElement;
    const elementB = {
      getBBox: () => ({ width: 30, height: 40, x: 0, y: 0 }),
    } as unknown as SVGGElement;
    const schedulerA = createNodeMeasurementScheduler();
    const schedulerB = createNodeMeasurementScheduler();

    schedulerA.schedule('shared-node', elementA, 10, 20, onMeasureA);
    schedulerB.schedule('shared-node', elementB, 30, 40, onMeasureB);
    schedulerA.cancel('shared-node');

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        expect(onMeasureA).not.toHaveBeenCalled();
        expect(onMeasureB).toHaveBeenCalledWith({ width: 30, height: 40 });
        resolve();
      });
    });
  });
});
