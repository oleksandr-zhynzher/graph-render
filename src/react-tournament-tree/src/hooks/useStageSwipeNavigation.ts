import { useEffect } from 'react';

export function useStageSwipeNavigation({
  contentViewportRef,
  isNavigationMode,
  onNextStage,
  onPreviousStage,
}: {
  contentViewportRef: React.RefObject<HTMLDivElement | null>;
  isNavigationMode: boolean;
  onNextStage: () => void;
  onPreviousStage: () => void;
}) {
  useEffect(() => {
    const container = contentViewportRef.current;
    if (!container || !isNavigationMode) return;

    let startX = 0;
    let startY = 0;
    const onTouchStart = (event: TouchEvent) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const dx = event.changedTouches[0].clientX - startX;
      const dy = event.changedTouches[0].clientY - startY;
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
