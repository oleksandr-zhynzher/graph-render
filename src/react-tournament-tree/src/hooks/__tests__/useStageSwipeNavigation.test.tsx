import { renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useStageSwipeNavigation } from '../useStageSwipeNavigation';

// jsdom does not implement the Touch constructor — polyfill it for testing.
if (global.Touch === undefined) {
  class TouchPolyfill {
    identifier: number;
    target: EventTarget;
    clientX: number;
    clientY: number;
    screenX: number;
    screenY: number;
    pageX: number;
    pageY: number;
    radiusX: number;
    radiusY: number;
    rotationAngle: number;
    force: number;
    constructor(init: {
      identifier: number;
      target: EventTarget;
      clientX?: number;
      clientY?: number;
      screenX?: number;
      screenY?: number;
      pageX?: number;
      pageY?: number;
      radiusX?: number;
      radiusY?: number;
      rotationAngle?: number;
      force?: number;
    }) {
      this.identifier = init.identifier;
      this.target = init.target;
      this.clientX = init.clientX ?? 0;
      this.clientY = init.clientY ?? 0;
      this.screenX = init.screenX ?? 0;
      this.screenY = init.screenY ?? 0;
      this.pageX = init.pageX ?? 0;
      this.pageY = init.pageY ?? 0;
      this.radiusX = init.radiusX ?? 1;
      this.radiusY = init.radiusY ?? 1;
      this.rotationAngle = init.rotationAngle ?? 0;
      this.force = init.force ?? 1;
    }
  }
  (global as Record<string, unknown>)['Touch'] = TouchPolyfill;
}

function makeContainer(): HTMLDivElement {
  const div = document.createElement('div');
  document.body.append(div);
  return div;
}

function dispatchTouchEvent(
  element: HTMLDivElement,
  type: 'touchstart' | 'touchend',
  clientX: number,
  clientY: number
) {
  const touch = new Touch({
    identifier: 1,
    target: element,
    clientX,
    clientY,
    screenX: clientX,
    screenY: clientY,
    pageX: clientX,
    pageY: clientY,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1,
  });

  const event = new TouchEvent(type, {
    touches: type === 'touchstart' ? [touch] : [],
    changedTouches: [touch],
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
}

describe('useStageSwipeNavigation', () => {
  it('does not attach listeners when isNavigationMode is false', () => {
    const container = makeContainer();
    const ref = createRef<HTMLDivElement | null>();
    ref.current = container;

    const onNext = vi.fn();
    const onPrev = vi.fn();

    renderHook(() =>
      useStageSwipeNavigation({
        contentViewportRef: ref,
        isNavigationMode: false,
        onNextStage: onNext,
        onPreviousStage: onPrev,
      })
    );

    // Swipe left (should be ignored since navigation mode is off)
    dispatchTouchEvent(container, 'touchstart', 200, 100);
    dispatchTouchEvent(container, 'touchend', 50, 100);

    expect(onNext).not.toHaveBeenCalled();
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('calls onNextStage when swiping left (dx < -60)', () => {
    const container = makeContainer();
    const ref = createRef<HTMLDivElement | null>();
    ref.current = container;

    const onNext = vi.fn();
    const onPrev = vi.fn();

    renderHook(() =>
      useStageSwipeNavigation({
        contentViewportRef: ref,
        isNavigationMode: true,
        onNextStage: onNext,
        onPreviousStage: onPrev,
      })
    );

    // dx = 50 - 200 = -150, |dx| > 60 and |dx| > |dy|*1.5
    dispatchTouchEvent(container, 'touchstart', 200, 100);
    dispatchTouchEvent(container, 'touchend', 50, 100);

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('calls onPreviousStage when swiping right (dx > 60)', () => {
    const container = makeContainer();
    const ref = createRef<HTMLDivElement | null>();
    ref.current = container;

    const onNext = vi.fn();
    const onPrev = vi.fn();

    renderHook(() =>
      useStageSwipeNavigation({
        contentViewportRef: ref,
        isNavigationMode: true,
        onNextStage: onNext,
        onPreviousStage: onPrev,
      })
    );

    // dx = 200 - 50 = 150, swiping right
    dispatchTouchEvent(container, 'touchstart', 50, 100);
    dispatchTouchEvent(container, 'touchend', 200, 100);

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('does not trigger navigation for small horizontal swipes (dx <= 60)', () => {
    const container = makeContainer();
    const ref = createRef<HTMLDivElement | null>();
    ref.current = container;

    const onNext = vi.fn();
    const onPrev = vi.fn();

    renderHook(() =>
      useStageSwipeNavigation({
        contentViewportRef: ref,
        isNavigationMode: true,
        onNextStage: onNext,
        onPreviousStage: onPrev,
      })
    );

    // dx = 40, not enough
    dispatchTouchEvent(container, 'touchstart', 100, 100);
    dispatchTouchEvent(container, 'touchend', 60, 100);

    expect(onNext).not.toHaveBeenCalled();
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('does not trigger navigation when vertical component dominates', () => {
    const container = makeContainer();
    const ref = createRef<HTMLDivElement | null>();
    ref.current = container;

    const onNext = vi.fn();
    const onPrev = vi.fn();

    renderHook(() =>
      useStageSwipeNavigation({
        contentViewportRef: ref,
        isNavigationMode: true,
        onNextStage: onNext,
        onPreviousStage: onPrev,
      })
    );

    // dx = -80, dy = -100 → |dx| < |dy|*1.5 → diagonal swipe, no nav
    dispatchTouchEvent(container, 'touchstart', 200, 200);
    dispatchTouchEvent(container, 'touchend', 120, 100);

    expect(onNext).not.toHaveBeenCalled();
    expect(onPrev).not.toHaveBeenCalled();
  });
});
