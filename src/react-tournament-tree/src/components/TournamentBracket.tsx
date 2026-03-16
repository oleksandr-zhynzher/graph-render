import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Graph, groupPositionedNodesByColumn } from '@graph-render/react';
import type {
  GraphConfig,
  GraphHandle,
  GraphRenderContext,
  GraphViewport,
  PositionedNode,
  VertexComponentProps,
} from '@graph-render/types';
import type { TournamentBracketProps } from '../types';
import { DARK_TOURNAMENT_CONFIG, DEFAULT_TOURNAMENT_CONFIG, NODE_DIMENSIONS } from '../constants';
import { SquashNode } from './SquashNode';
import { BracketToolbar } from './BracketToolbar';
import { BracketThemeProvider, useBracketTheme } from '../contexts/BracketThemeContext';
import { injectTournamentPathKeys } from '../utils/pathKeys';
import { roundLabelsForGraph } from '../utils/roundLabels';

const STAGE_LABEL_HEIGHT = 20;
const NAVIGATION_STAGE_PADDING_X = 52;
const NAVIGATION_STAGE_PADDING_Y = 44;
const NAVIGATION_STAGE_MIN_WIDTH = 420;
const NAVIGATION_STAGE_MIN_HEIGHT = 250;
const NAVIGATION_MIN_ZOOM = 0.45;
const NAVIGATION_MAX_ZOOM = 2.1;

type StageBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

type StageView = {
  index: number;
  label: string;
  bounds: StageBounds;
  nodeIds: string[];
};

type VerticalStagePosition = 'top' | 'bottom';

type StageViewportResult = {
  viewport: GraphViewport;
  canPageVertically: boolean;
};

type StageSyncProps = {
  context: GraphRenderContext;
  labels: string[];
  labelOffset: number;
  onStagesChange: (stages: StageView[]) => void;
};

const ChevronLeftIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m14.5 5-7 7 7 7"
      stroke={color}
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRightIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m9.5 5 7 7-7 7"
      stroke={color}
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronUpIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m5 14.5 7-7 7 7"
      stroke={color}
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDownIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m5 9.5 7 7 7-7"
      stroke={color}
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StageNavigationIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="14" rx="3" stroke={color} strokeWidth="1.8" />
    <path d="M8.5 5v14M15.5 5v14" stroke={color} strokeWidth="1.4" opacity="0.72" />
    <circle cx="12" cy="12" r="2.2" fill={color} />
  </svg>
);

function buildStageViews(
  nodes: PositionedNode[],
  labels: string[],
  labelOffset: number
): StageView[] {
  return groupPositionedNodesByColumn(nodes).map((column, index) => {
    const columnNodes = column.nodes;
    const minX = Math.min(...columnNodes.map((node) => node.position.x));
    const minY = Math.min(...columnNodes.map((node) => node.position.y));
    const maxX = Math.max(
      ...columnNodes.map((node) => node.position.x + (node.size?.width ?? NODE_DIMENSIONS.WIDTH))
    );
    const maxY = Math.max(
      ...columnNodes.map((node) => node.position.y + (node.size?.height ?? NODE_DIMENSIONS.HEIGHT))
    );

    const bounds = {
      minX,
      minY: minY - labelOffset - STAGE_LABEL_HEIGHT + 6,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - (minY - labelOffset - STAGE_LABEL_HEIGHT + 6),
    };

    return {
      index,
      label: labels[index] ?? `STAGE ${index + 1}`,
      bounds,
      nodeIds: columnNodes.map((node) => node.id),
    };
  });
}

function getStageViewport(
  bounds: StageBounds,
  width: number,
  height: number,
  verticalPosition: VerticalStagePosition = 'top'
): StageViewportResult {
  const targetWidth = Math.max(
    bounds.width + NAVIGATION_STAGE_PADDING_X * 2,
    NAVIGATION_STAGE_MIN_WIDTH
  );
  const targetHeight = Math.max(
    bounds.height + NAVIGATION_STAGE_PADDING_Y * 2,
    NAVIGATION_STAGE_MIN_HEIGHT
  );
  const zoom = Math.min(
    NAVIGATION_MAX_ZOOM,
    Math.max(NAVIGATION_MIN_ZOOM, Math.min(width / targetWidth, height / targetHeight))
  );

  const visibleWorldHeight = height / zoom;
  const minTop = bounds.minY - NAVIGATION_STAGE_PADDING_Y;
  const maxTop = bounds.maxY + NAVIGATION_STAGE_PADDING_Y - visibleWorldHeight;
  const canPageVertically = maxTop > minTop + 1;
  const centeredTop = bounds.minY + bounds.height / 2 - visibleWorldHeight / 2;
  const topWorld = canPageVertically
    ? verticalPosition === 'bottom'
      ? maxTop
      : minTop
    : centeredTop;

  return {
    canPageVertically,
    viewport: {
      zoom,
      x: (width - bounds.width * zoom) / 2 - bounds.minX * zoom,
      y: -topWorld * zoom,
    },
  };
}

function GraphStageSync({ context, labels, labelOffset, onStagesChange }: StageSyncProps) {
  const stages = useMemo(
    () => buildStageViews(context.nodes, labels, labelOffset),
    [context.nodes, labelOffset, labels]
  );

  useEffect(() => {
    onStagesChange(stages);
  }, [onStagesChange, stages]);

  return null;
}

const TrophyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M8 3h8v3a4 4 0 0 1-8 0V3Z" fill="currentColor" />
    <path
      d="M6 5H4a2 2 0 0 0 2 2M18 5h2a2 2 0 0 1-2 2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 10v4M9 21h6M10 18h4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

function BracketFrame({
  children,
  title,
  badgeText,
  stageLabels,
  isDarkMode,
  isNavigationMode,
  stageViews,
  activeStageIndex,
  verticalStagePosition,
  canPagePlayersVertically,
  contentViewportRef,
  showToolbar,
  onToggleNavigationMode,
  onSelectStage,
  onPreviousStage,
  onNextStage,
  onPagePlayersUp,
  onPagePlayersDown,
  onToggleDarkMode,
  onExportSVG,
}: {
  children: React.ReactNode;
  title: string;
  badgeText: string;
  stageLabels: string[];
  isDarkMode: boolean;
  isNavigationMode: boolean;
  stageViews: StageView[];
  activeStageIndex: number;
  verticalStagePosition: VerticalStagePosition;
  canPagePlayersVertically: boolean;
  contentViewportRef: React.RefObject<HTMLDivElement>;
  showToolbar: boolean;
  onToggleNavigationMode: () => void;
  onSelectStage: (index: number) => void;
  onPreviousStage: () => void;
  onNextStage: () => void;
  onPagePlayersUp: () => void;
  onPagePlayersDown: () => void;
  onToggleDarkMode: () => void;
  onExportSVG: () => void;
}) {
  const { colors } = useBracketTheme();
  const navButtonTextColor = isDarkMode ? '#f7f5ef' : '#3f4a38';
  const navButtonBg = isDarkMode ? 'rgba(35, 43, 51, 0.92)' : 'rgba(255, 255, 255, 0.92)';
  const navButtonBorder = isDarkMode ? '#46505c' : '#ddd7cb';
  const floatingControlBg = isDarkMode ? 'rgba(35, 43, 51, 0.94)' : 'rgba(255, 255, 255, 0.94)';
  const floatingControlBorder = isDarkMode ? '#38424d' : '#e5dfd4';
  const floatingControlText = isNavigationMode
    ? isDarkMode
      ? '#f4f8f1'
      : '#516347'
    : isDarkMode
      ? '#d8d2c7'
      : '#59606c';
  const canGoPrev = activeStageIndex > 0;
  const canGoNext = activeStageIndex < stageViews.length - 1;
  const canPageUp = canPagePlayersVertically && verticalStagePosition === 'bottom';
  const canPageDown = canPagePlayersVertically && verticalStagePosition === 'top';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1180,
        background: colors.SURFACE_BG,
        borderRadius: 24,
        boxShadow: colors.SHADOW,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          minHeight: 72,
          padding: '0 32px',
          background: colors.HEADER_BG,
          borderBottom: `1px solid ${colors.HEADER_BORDER}`,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            display: 'grid',
            placeItems: 'center',
            background: colors.ICON_BG,
            color: colors.ICON_FG,
            flexShrink: 0,
          }}
        >
          <TrophyIcon />
        </div>
        <div
          style={{
            fontFamily: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
            fontSize: 18,
            fontWeight: 600,
            color: colors.HEADER_TITLE,
          }}
        >
          {title}
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            minHeight: 28,
            padding: '0 14px',
            borderRadius: 999,
            background: colors.BADGE_BG,
            color: colors.BADGE_TEXT,
            fontFamily: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: colors.BADGE_DOT,
              flexShrink: 0,
            }}
          />
          {badgeText}
        </div>
        {showToolbar ? (
          <BracketToolbar
            isDarkMode={isDarkMode}
            isNavigationMode={isNavigationMode}
            onToggleNavigationMode={onToggleNavigationMode}
            onToggleDarkMode={onToggleDarkMode}
            onExportSVG={onExportSVG}
          />
        ) : null}
      </div>

      {stageLabels.length ? (
        <div
          style={{
            padding: '14px 32px 12px',
            background: isDarkMode ? '#20262d' : '#fbfaf7',
            borderBottom: `1px solid ${colors.HEADER_BORDER}`,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${stageLabels.length}, minmax(0, 1fr))`,
              gap: 24,
              alignItems: 'center',
            }}
          >
            {stageLabels.map((label, index) => {
              const isActiveStage = isNavigationMode && index === activeStageIndex;

              return (
                <div
                  key={label}
                  style={{
                    display: 'grid',
                    justifyItems: 'center',
                    gap: 8,
                    minWidth: 0,
                    padding: '6px 10px',
                    borderRadius: 14,
                    background:
                      isActiveStage && isDarkMode
                        ? 'rgba(216, 210, 199, 0.08)'
                        : isActiveStage
                          ? 'rgba(124, 144, 112, 0.08)'
                          : 'transparent',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 1,
                      background: isActiveStage
                        ? isDarkMode
                          ? 'rgba(247, 245, 239, 0.62)'
                          : 'rgba(68, 75, 85, 0.34)'
                        : isDarkMode
                          ? 'rgba(216, 210, 199, 0.24)'
                          : 'rgba(68, 75, 85, 0.16)',
                    }}
                  />
                  <div
                    style={{
                      fontFamily: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: isActiveStage
                        ? isDarkMode
                          ? '#f7f5ef'
                          : '#2f3741'
                        : isDarkMode
                          ? '#d8d2c7'
                          : '#444b55',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div
        ref={contentViewportRef}
        style={{
          position: 'relative',
          padding: '12px 24px 24px',
          overflowX: isNavigationMode ? 'hidden' : 'auto',
          overflowY: 'hidden',
          background: isDarkMode
            ? 'radial-gradient(circle at top left, rgba(154, 176, 141, 0.08), transparent 28%), #191e24'
            : 'radial-gradient(circle at top left, rgba(124, 144, 112, 0.08), transparent 28%), #f7f6f3',
        }}
      >
        {children}

        {showToolbar ? (
          <div
            style={{
              position: 'absolute',
              right: 18,
              top: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: 8,
              borderRadius: 22,
              border: `1px solid ${floatingControlBorder}`,
              background: floatingControlBg,
              boxShadow: isDarkMode
                ? '0 18px 40px rgba(0, 0, 0, 0.28)'
                : '0 18px 40px rgba(45, 45, 45, 0.12)',
            }}
          >
            <button
              type="button"
              onClick={onToggleNavigationMode}
              aria-pressed={isNavigationMode}
              title={isNavigationMode ? 'Exit Navigation Mode' : 'Enter Navigation Mode'}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                border: `1px solid ${isNavigationMode ? colors.ICON_BG : floatingControlBorder}`,
                background: isNavigationMode ? colors.ICON_BG : 'transparent',
                color: isNavigationMode ? colors.ICON_FG : floatingControlText,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              <StageNavigationIcon
                color={isNavigationMode ? colors.ICON_FG : floatingControlText}
              />
            </button>
          </div>
        ) : null}

        {isNavigationMode && stageViews.length > 1 ? (
          <>
            <button
              type="button"
              onClick={onPreviousStage}
              disabled={!canGoPrev}
              aria-label="Go to previous stage"
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 42,
                height: 42,
                borderRadius: 999,
                border: `1px solid ${navButtonBorder}`,
                background: navButtonBg,
                color: navButtonTextColor,
                display: 'grid',
                placeItems: 'center',
                boxShadow: isDarkMode
                  ? '0 12px 30px rgba(0, 0, 0, 0.22)'
                  : '0 12px 30px rgba(45, 45, 45, 0.12)',
                opacity: canGoPrev ? 1 : 0.45,
                cursor: canGoPrev ? 'pointer' : 'default',
              }}
            >
              <ChevronLeftIcon color={navButtonTextColor} />
            </button>

            <button
              type="button"
              onClick={onNextStage}
              disabled={!canGoNext}
              aria-label="Go to next stage"
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 42,
                height: 42,
                borderRadius: 999,
                border: `1px solid ${navButtonBorder}`,
                background: navButtonBg,
                color: navButtonTextColor,
                display: 'grid',
                placeItems: 'center',
                boxShadow: isDarkMode
                  ? '0 12px 30px rgba(0, 0, 0, 0.22)'
                  : '0 12px 30px rgba(45, 45, 45, 0.12)',
                opacity: canGoNext ? 1 : 0.45,
                cursor: canGoNext ? 'pointer' : 'default',
              }}
            >
              <ChevronRightIcon color={navButtonTextColor} />
            </button>

            {canPagePlayersVertically ? (
              <div
                style={{
                  position: 'absolute',
                  right: 18,
                  bottom: 86,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onClick={onPagePlayersUp}
                  disabled={!canPageUp}
                  aria-label="Show upper players"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    border: `1px solid ${navButtonBorder}`,
                    background: navButtonBg,
                    color: navButtonTextColor,
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: isDarkMode
                      ? '0 12px 30px rgba(0, 0, 0, 0.22)'
                      : '0 12px 30px rgba(45, 45, 45, 0.12)',
                    opacity: canPageUp ? 1 : 0.45,
                    cursor: canPageUp ? 'pointer' : 'default',
                  }}
                >
                  <ChevronUpIcon color={navButtonTextColor} />
                </button>
                <button
                  type="button"
                  onClick={onPagePlayersDown}
                  disabled={!canPageDown}
                  aria-label="Show lower players"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    border: `1px solid ${navButtonBorder}`,
                    background: navButtonBg,
                    color: navButtonTextColor,
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: isDarkMode
                      ? '0 12px 30px rgba(0, 0, 0, 0.22)'
                      : '0 12px 30px rgba(45, 45, 45, 0.12)',
                    opacity: canPageDown ? 1 : 0.45,
                    cursor: canPageDown ? 'pointer' : 'default',
                  }}
                >
                  <ChevronDownIcon color={navButtonTextColor} />
                </button>
              </div>
            ) : null}

            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: 14,
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                maxWidth: 'calc(100% - 120px)',
                padding: '8px 10px',
                borderRadius: 999,
                border: `1px solid ${navButtonBorder}`,
                background: navButtonBg,
                boxShadow: isDarkMode
                  ? '0 18px 38px rgba(0, 0, 0, 0.24)'
                  : '0 18px 38px rgba(45, 45, 45, 0.12)',
                overflowX: 'auto',
              }}
            >
              {stageViews.map((stage, index) => {
                const isActive = index === activeStageIndex;

                return (
                  <button
                    key={stage.label}
                    type="button"
                    onClick={() => onSelectStage(index)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: `1px solid ${isActive ? colors.ICON_BG : navButtonBorder}`,
                      background: isActive ? colors.ICON_BG : 'transparent',
                      color: isActive ? colors.ICON_FG : colors.BADGE_TEXT,
                      fontFamily: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                    }}
                  >
                    {stage.label}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export const TournamentBracket = React.memo<TournamentBracketProps>(function TournamentBracket({
  graph,
  config,
  vertexComponent,
  nodeRenderMode = 'export',
  title = 'Tournament Bracket',
  badgeText,
  showToolbar = true,
  onInvalidNode,
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<GraphHandle>(null);
  const contentViewportRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNavigationMode, setIsNavigationMode] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [stageViews, setStageViews] = useState<StageView[]>([]);
  const [verticalStagePosition, setVerticalStagePosition] = useState<VerticalStagePosition>('top');
  const [canPagePlayersVertically, setCanPagePlayersVertically] = useState(false);
  const previousViewportRef = useRef<GraphViewport | null>(null);

  const labels = useMemo(
    () => config?.labels ?? roundLabelsForGraph(graph),
    [config?.labels, graph]
  );

  const mergedConfig = useMemo(() => {
    const { theme: themeOverride, ...restConfig } = config ?? {};
    const baseConfig = isDarkMode ? DARK_TOURNAMENT_CONFIG : DEFAULT_TOURNAMENT_CONFIG;
    const baseTheme = baseConfig.theme ?? {};

    return {
      ...baseConfig,
      ...restConfig,
      labels: undefined,
      autoLabels: false,
      theme: { ...baseTheme, ...(themeOverride ?? {}) },
    } satisfies GraphConfig;
  }, [config, labels, isDarkMode]);

  const enrichedGraph = useMemo(() => {
    const graphWithPaths = injectTournamentPathKeys(graph);

    if (vertexComponent) {
      return graphWithPaths;
    }

    const sizedNodes = Object.entries(graphWithPaths.nodes ?? {}).reduce<
      NonNullable<typeof graphWithPaths.nodes>
    >((acc, [nodeId, attrs]) => {
      const size = attrs.size;

      acc[nodeId] = {
        ...attrs,
        size: {
          width: Math.max(size?.width ?? 0, NODE_DIMENSIONS.WIDTH),
          height: Math.max(size?.height ?? 0, NODE_DIMENSIONS.HEIGHT),
        },
      };

      return acc;
    }, {});

    return {
      ...graphWithPaths,
      nodes: sizedNodes,
    };
  }, [graph, vertexComponent]);

  const resolvedBadgeText = useMemo(() => {
    if (badgeText) {
      return badgeText;
    }

    const nodeCount = Object.keys(enrichedGraph.nodes ?? {}).length;
    const finalLabel = labels.at(-1) ?? 'FINAL';
    return nodeCount > 0 ? `${finalLabel} · ${nodeCount} MATCHES` : finalLabel;
  }, [badgeText, enrichedGraph.nodes, labels]);

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const handleStagesChange = useCallback((nextStages: StageView[]) => {
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
  }, []);

  const focusStage = useCallback(
    (stageIndex: number) => {
      const stage = stageViews[stageIndex];
      const container = contentViewportRef.current;
      if (!stage || !container || !graphRef.current) {
        return;
      }

      const width = container.clientWidth || mergedConfig.width || 1600;
      const height = container.clientHeight || mergedConfig.height || 1200;
      const nextStageViewport = getStageViewport(
        stage.bounds,
        width,
        height,
        verticalStagePosition
      );
      setCanPagePlayersVertically(nextStageViewport.canPageVertically);
      graphRef.current.setViewport(nextStageViewport.viewport);
    },
    [mergedConfig.height, mergedConfig.width, stageViews, verticalStagePosition]
  );

  const handleToggleNavigationMode = useCallback(() => {
    if (isNavigationMode) {
      const previousViewport = previousViewportRef.current;
      if (previousViewport) {
        graphRef.current?.setViewport(previousViewport);
      } else {
        graphRef.current?.fitView();
      }
      setIsNavigationMode(false);
      return;
    }

    previousViewportRef.current = graphRef.current?.getViewport() ?? null;
    setVerticalStagePosition('top');
    setIsNavigationMode(true);
  }, [isNavigationMode]);

  const handleSelectStage = useCallback((stageIndex: number) => {
    setVerticalStagePosition('top');
    setActiveStageIndex(stageIndex);
  }, []);

  const handlePreviousStage = useCallback(() => {
    setVerticalStagePosition('top');
    setActiveStageIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextStage = useCallback(() => {
    setVerticalStagePosition('top');
    setActiveStageIndex((prev) => Math.min(stageViews.length - 1, prev + 1));
  }, [stageViews.length]);

  const handlePagePlayersUp = useCallback(() => {
    setVerticalStagePosition('top');
  }, []);

  const handlePagePlayersDown = useCallback(() => {
    setVerticalStagePosition('bottom');
  }, []);

  useEffect(() => {
    setActiveStageIndex((prev) => Math.min(prev, Math.max(stageViews.length - 1, 0)));
  }, [stageViews.length]);

  useEffect(() => {
    if (!isNavigationMode || !stageViews.length) {
      return;
    }

    focusStage(activeStageIndex);
  }, [activeStageIndex, focusStage, isNavigationMode, stageViews.length]);

  useEffect(() => {
    if (!isNavigationMode) {
      return;
    }

    const handleResize = () => focusStage(activeStageIndex);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeStageIndex, focusStage, isNavigationMode]);

  const exportVertexComponent = useMemo(
    () =>
      vertexComponent ??
      ((props: VertexComponentProps) => (
        <SquashNode {...props} renderMode="export" onRenderError={onInvalidNode} />
      )),
    [onInvalidNode, vertexComponent]
  );

  const handleExportSVG = useCallback(() => {
    const renderExportFromElement = (rootElement: Element | null) => {
      const svgElement = rootElement?.querySelector('svg');
      if (!svgElement) {
        return;
      }

      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tournament-bracket-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    if (nodeRenderMode !== 'html' || vertexComponent) {
      renderExportFromElement(wrapperRef.current);
      return;
    }

    const host = document.createElement('div');
    host.style.position = 'absolute';
    host.style.width = '0';
    host.style.height = '0';
    host.style.overflow = 'hidden';
    host.style.opacity = '0';
    host.style.pointerEvents = 'none';
    document.body.appendChild(host);

    const exportRoot = createRoot(host);

    try {
      flushSync(() => {
        exportRoot.render(
          <BracketThemeProvider mode={isDarkMode ? 'dark' : 'light'}>
            <Graph
              graph={enrichedGraph}
              vertexComponent={exportVertexComponent}
              config={mergedConfig}
            />
          </BracketThemeProvider>
        );
      });

      renderExportFromElement(host);
    } finally {
      exportRoot.unmount();
      document.body.removeChild(host);
    }
  }, [
    enrichedGraph,
    exportVertexComponent,
    isDarkMode,
    mergedConfig,
    nodeRenderMode,
    vertexComponent,
  ]);

  const resolvedVertexComponent = useMemo(
    () =>
      vertexComponent ??
      ((props: VertexComponentProps) => (
        <SquashNode {...props} renderMode={nodeRenderMode} onRenderError={onInvalidNode} />
      )),
    [nodeRenderMode, onInvalidNode, vertexComponent]
  );

  return (
    <BracketThemeProvider mode={isDarkMode ? 'dark' : 'light'}>
      <BracketFrame
        title={title}
        badgeText={resolvedBadgeText}
        stageLabels={labels}
        isDarkMode={isDarkMode}
        isNavigationMode={isNavigationMode}
        stageViews={stageViews}
        activeStageIndex={activeStageIndex}
        verticalStagePosition={verticalStagePosition}
        canPagePlayersVertically={canPagePlayersVertically}
        contentViewportRef={contentViewportRef}
        showToolbar={showToolbar}
        onToggleNavigationMode={handleToggleNavigationMode}
        onSelectStage={handleSelectStage}
        onPreviousStage={handlePreviousStage}
        onNextStage={handleNextStage}
        onPagePlayersUp={handlePagePlayersUp}
        onPagePlayersDown={handlePagePlayersDown}
        onToggleDarkMode={handleToggleDarkMode}
        onExportSVG={handleExportSVG}
      >
        <div ref={wrapperRef} style={{ minWidth: 'fit-content' }}>
          <Graph
            ref={graphRef}
            graph={enrichedGraph}
            vertexComponent={resolvedVertexComponent}
            config={mergedConfig}
            panEnabled={!isNavigationMode}
            zoomEnabled={!isNavigationMode}
            pinchZoomEnabled={!isNavigationMode}
            renderOverlay={(context) => (
              <GraphStageSync
                context={context}
                labels={labels}
                labelOffset={mergedConfig.labelOffset ?? 46}
                onStagesChange={handleStagesChange}
              />
            )}
          />
        </div>
      </BracketFrame>
    </BracketThemeProvider>
  );
});

TournamentBracket.displayName = 'TournamentBracket';
