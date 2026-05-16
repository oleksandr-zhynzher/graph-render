import { useCallback, useEffect, useRef, useState } from 'react';
import type { GraphViewport, StageView, VerticalStagePosition } from '@graph-render/types';
import { getStageViewport } from '../utils/stageViewport';
import { useStageSwipeNavigation } from './useStageSwipeNavigation';
import type { UseStageNavigationParams } from '../models/bracket';

export function useStageNavigation({
  defaultNavigationMode,
  graphRef,
  contentViewportRef,
  graphWidth,
  graphHeight,
  stageViews,
  setStageViews,
}: UseStageNavigationParams) {
  const [isNavigationMode, setIsNavigationMode] = useState(defaultNavigationMode);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [verticalStagePosition, setVerticalStagePosition] = useState<VerticalStagePosition>('top');
  const [canPagePlayersVertically, setCanPagePlayersVertically] = useState(false);
  const previousViewportRef = useRef<GraphViewport | null>(null);

  const handleStagesChange = useCallback(
    (nextStages: StageView[]) => {
      setStageViews((prevStages) => {
        const isSame =
          prevStages.length === nextStages.length &&
          prevStages.every((stage, index) => {
            const nextStage = nextStages[index];
            return (
              stage.label === nextStage.label &&
              stage.bounds.minX === nextStage.bounds.minX &&
              stage.bounds.minY === nextStage.bounds.minY &&
              stage.bounds.maxX === nextStage.bounds.maxX &&
              stage.bounds.maxY === nextStage.bounds.maxY
            );
          });

        return isSame ? prevStages : nextStages;
      });
    },
    [setStageViews]
  );

  const focusStage = useCallback(
    (stageIndex: number) => {
      const stage = stageViews[stageIndex];
      const container = contentViewportRef.current;
      if (!stage || !container || !graphRef.current) {
        return;
      }

      const width = container.clientWidth || graphWidth || 1600;
      const height = container.clientHeight || graphHeight || 1200;
      const nextStageViewport = getStageViewport(
        stage.bounds,
        width,
        height,
        verticalStagePosition
      );
      setCanPagePlayersVertically(nextStageViewport.canPageVertically);
      graphRef.current.setViewport(nextStageViewport.viewport);
    },
    [contentViewportRef, graphHeight, graphRef, graphWidth, stageViews, verticalStagePosition]
  );

  const handleToggleNavigationMode = useCallback(() => {
    if (isNavigationMode) {
      const previousViewport = previousViewportRef.current;
      if (previousViewport) graphRef.current?.setViewport(previousViewport);
      else graphRef.current?.fitView();
      setIsNavigationMode(false);
      return;
    }

    previousViewportRef.current = graphRef.current?.getViewport() ?? null;
    setVerticalStagePosition('top');
    setIsNavigationMode(true);
  }, [graphRef, isNavigationMode]);

  const selectStage = useCallback((stageIndex: number) => {
    setVerticalStagePosition('top');
    setActiveStageIndex(stageIndex);
  }, []);

  const previousStage = useCallback(() => {
    setVerticalStagePosition('top');
    setActiveStageIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const nextStage = useCallback(() => {
    setVerticalStagePosition('top');
    setActiveStageIndex((prev) => Math.min(Math.max(stageViews.length - 1, 0), prev + 1));
  }, [stageViews.length]);

  useEffect(() => {
    setActiveStageIndex((prev) => Math.min(prev, Math.max(stageViews.length - 1, 0)));
  }, [stageViews.length]);

  useEffect(() => {
    if (isNavigationMode && stageViews.length) focusStage(activeStageIndex);
  }, [activeStageIndex, focusStage, isNavigationMode, stageViews.length]);

  useEffect(() => {
    if (!isNavigationMode) return;
    const handleResize = () => focusStage(activeStageIndex);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeStageIndex, focusStage, isNavigationMode]);

  useStageSwipeNavigation({
    contentViewportRef,
    isNavigationMode,
    onNextStage: nextStage,
    onPreviousStage: previousStage,
  });

  return {
    isNavigationMode,
    activeStageIndex,
    verticalStagePosition,
    canPagePlayersVertically,
    handleStagesChange,
    handleToggleNavigationMode,
    handleSelectStage: selectStage,
    handlePreviousStage: previousStage,
    handleNextStage: nextStage,
    handlePagePlayersUp: () => setVerticalStagePosition('top'),
    handlePagePlayersDown: () => setVerticalStagePosition('bottom'),
  };
}
