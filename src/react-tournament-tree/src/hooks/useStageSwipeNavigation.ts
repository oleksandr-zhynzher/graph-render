import { useEffect } from 'react';

export function useStageSwipeNavigation({
  contentViewportRef,
  isNavigationMode,
  onNextStage,
  onPreviousStage,
}: {
  readonly contentViewportRef: React.RefObject<HTMLDivElement | null>;
  readonly isNavigationMode: boolean;
  readonly onNextStage: () => void;
  readonly onPreviousStage: () => void;
}) {
  useEffect(() => {
    const container = contentViewportRef.current;
    if (!container || !isNavigationMode) return;

    let startX = 0;
    let startY = 0;
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) onNextStage();
        else onPreviousStage();
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [contentViewportRef, isNavigationMode, onNextStage, onPreviousStage]);
}
