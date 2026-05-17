import type { GraphHandle, StageView, TournamentBracketProps } from '@graph-render/types';
import { SquashNodeRenderMode } from '@graph-render/types';
import React, { useMemo, useRef, useState } from 'react';

import { BracketAppearanceProvider } from '../contexts/BracketAppearanceContext';
import { useBracketSvgExport } from '../hooks/useBracketSvgExport';
import { useBracketVertexComponents } from '../hooks/useBracketVertexComponents';
import { useDocumentDarkMode } from '../hooks/useDocumentDarkMode';
import { useStageNavigation } from '../hooks/useStageNavigation';
import {
  buildBracketGraph,
  buildGraphConfig,
  getTranslateExtent,
  resolveBadgeText,
} from '../utils/bracketGraph';
import { resolveBracketAppearance } from '../utils/resolveBracketAppearance';
import { roundLabelsForGraph } from '../utils/roundLabels';
import { BracketFrame } from './Bracket/BracketFrame';
import { BracketGraphCanvas } from './Bracket/BracketGraphCanvas';

export const TournamentBracket = React.memo<TournamentBracketProps>(function TournamentBracket({
  graph,
  config,
  appearance,
  defaultViewport,
  vertexComponent,
  nodeRenderMode = SquashNodeRenderMode.Export,
  title = 'Tournament Bracket',
  badgeText,
  showToolbar = true,
  showViewportControls = false,
  defaultNavigationMode = true,
  panEnabled,
  zoomEnabled,
  pinchZoomEnabled,
  compact = true,
  onMatchClick,
  onInvalidNode,
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<GraphHandle>(null);
  const contentViewportRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, toggleDarkMode } = useDocumentDarkMode();
  const [stageViews, setStageViews] = useState<readonly StageView[]>([]);

  const labels = useMemo(
    () => config?.labels ?? roundLabelsForGraph(graph),
    [config?.labels, graph]
  );
  const resolvedAppearance = useMemo(
    () => resolveBracketAppearance(appearance, isDarkMode, compact),
    [appearance, compact, isDarkMode]
  );
  const mergedConfig = useMemo(
    () => buildGraphConfig(config, isDarkMode, compact, resolvedAppearance.matchCard),
    [compact, config, isDarkMode, resolvedAppearance.matchCard]
  );
  const enrichedGraph = useMemo(
    () => buildBracketGraph(graph, Boolean(vertexComponent), resolvedAppearance.matchCard),
    [graph, resolvedAppearance.matchCard, vertexComponent]
  );
  const resolvedBadgeText = useMemo(
    () => resolveBadgeText(badgeText, enrichedGraph, labels),
    [badgeText, enrichedGraph, labels]
  );
  const translateExtent = useMemo(() => getTranslateExtent(stageViews), [stageViews]);
  const navigation = useStageNavigation({
    defaultNavigationMode,
    graphRef,
    contentViewportRef,
    graphWidth: mergedConfig.width,
    graphHeight: mergedConfig.height,
    stageViews,
    setStageViews,
  });

  const { exportVertexComponent, resolvedVertexComponent } = useBracketVertexComponents({
    compact,
    nodeRenderMode,
    onInvalidNode,
    vertexComponent,
  });
  const handleExportSVG = useBracketSvgExport({
    wrapperRef,
    nodeRenderMode,
    vertexComponent,
    isDarkMode,
    enrichedGraph,
    exportVertexComponent,
    mergedConfig,
    appearance,
    compact,
  });

  return (
    <BracketAppearanceProvider
      appearance={appearance}
      isDarkMode={isDarkMode}
      compact={compact}
    >
      <BracketFrame
        title={title}
        badgeText={resolvedBadgeText}
        stageLabels={labels}
        isDarkMode={isDarkMode}
        isNavigationMode={navigation.isNavigationMode}
        stageViews={stageViews}
        activeStageIndex={navigation.activeStageIndex}
        verticalStagePosition={navigation.verticalStagePosition}
        canPagePlayersVertically={navigation.canPagePlayersVertically}
        contentViewportRef={contentViewportRef}
        showToolbar={showToolbar}
        compact={compact}
        onToggleNavigationMode={navigation.handleToggleNavigationMode}
        onPreviousStage={navigation.handlePreviousStage}
        onNextStage={navigation.handleNextStage}
        onPagePlayersUp={navigation.handlePagePlayersUp}
        onPagePlayersDown={navigation.handlePagePlayersDown}
        onToggleDarkMode={toggleDarkMode}
        onExportSVG={handleExportSVG}
      >
        <BracketGraphCanvas
          graphRef={graphRef}
          wrapperRef={wrapperRef}
          graph={enrichedGraph}
          vertexComponent={resolvedVertexComponent}
          config={mergedConfig}
          defaultViewport={defaultViewport}
          isNavigationMode={navigation.isNavigationMode}
          translateExtent={translateExtent}
          showViewportControls={showViewportControls}
          panEnabled={panEnabled}
          zoomEnabled={zoomEnabled}
          pinchZoomEnabled={pinchZoomEnabled}
          labels={labels}
          onStagesChange={navigation.handleStagesChange}
          onMatchClick={onMatchClick}
        />
      </BracketFrame>
    </BracketAppearanceProvider>
  );
});

TournamentBracket.displayName = 'TournamentBracket';
