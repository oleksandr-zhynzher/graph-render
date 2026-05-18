import { fromNxGraph, layoutNodes } from '@graph-render/core';
import { Graph } from '@graph-render/react';
import type { StageView } from '@graph-render/tournament-tree';
import {
  BracketAppearanceProvider,
  buildStageViews,
  getStageViewport,
  injectTournamentPathKeys,
  NODE_DIMENSIONS,
  NODE_DIMENSIONS_STAGE_NAV,
  roundLabelsForGraph,
  routeBracketEdges,
  SquashNode,
  SquashNodeRenderMode,
  VerticalStagePosition,
} from '@graph-render/tournament-tree';
import type {
  GraphConfig,
  GraphHandle,
  GraphSearchResults,
  GraphSelection,
  GraphViewport,
  NxGraphInput,
  PositionedEdge,
  PositionedNode,
  VertexComponent,
  VertexComponentProps,
} from '@graph-render/types';
import { EdgeType, LayoutDirection, LayoutType } from '@graph-render/types';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

export interface BracketPlaygroundProps {
  readonly graph: NxGraphInput;
  readonly layout?: GraphConfig['layout'];
  readonly layoutDirection?: GraphConfig['layoutDirection'];
  readonly routingStyle?: GraphConfig['routingStyle'];
  readonly curveEdges?: boolean;
  readonly nodeSizing?: GraphConfig['nodeSizing'];
  readonly selectionMode?: 'single' | 'multiple';
  readonly renderMode?: SquashNodeRenderMode;
  readonly isCompact?: boolean;
  readonly highlightMode?: HighlightMode;
  readonly hideUnmatchedSearch?: boolean;
  readonly marqueeSelectionEnabled?: boolean;
  readonly hoverHighlight?: boolean;
  readonly showViewportControls?: boolean;
  readonly searchQuery?: string;
  readonly isDarkMode?: boolean;
}

type HighlightMode = 'match' | 'ancestry';
type HoverState = { readonly kind: 'node' | 'edge'; readonly id: string } | null;
const LIGHT_THEME: NonNullable<GraphConfig['theme']> = {
  background: '#ffffff',
  edgeColor: '#d9d6cf',
  edgeWidth: 2,
  nodeGap: 48,
  fontFamily: '"Space Grotesk", "Segoe UI", system-ui, sans-serif',
};

const DARK_THEME: NonNullable<GraphConfig['theme']> = {
  background: '#020617',
  edgeColor: '#5d6470',
  edgeWidth: 2,
  nodeGap: 48,
  fontFamily: '"Space Grotesk", "Segoe UI", system-ui, sans-serif',
};

const INITIAL_VIEWPORT: GraphViewport = { x: 0, y: 0, zoom: 1 };
const EMPTY_SELECTION: GraphSelection = { nodeIds: [], edgeIds: [] };
const PANEL_WIDTH = 320;
/** Extra layout inset around bracket edges inside layout bounds (inside the canvas). */
const BRACKET_STORY_LAYOUT_PADDING = 10;
/** Padding around the graph frame in the playground main column. */
const BRACKET_STORY_OUTER_PADDING = 10;
/** Padding used when fitting the bracket to the graph viewport control. */
const BRACKET_STORY_FIT_VIEW_PADDING = 12;
const DEFAULT_CANVAS_SIZE = { width: 1200, height: 900 };
const LABEL_PILL_WIDTH = 64;
const LABEL_PILL_HEIGHT = 20;
const FIT_PADDING = {
  top: 22,
  right: 14,
  bottom: 52,
  left: 14,
};

const controlSectionStyle: React.CSSProperties = {
  display: 'grid',
  gap: 10,
  paddingBottom: 14,
  borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  color: '#94a3b8',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 8,
  border: '1px solid rgba(148, 163, 184, 0.24)',
  padding: '8px 10px',
  fontSize: 14,
  background: '#fff',
  color: '#0f172a',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
};

const buttonStyle: React.CSSProperties = {
  border: '1px solid rgba(148, 163, 184, 0.28)',
  borderRadius: 8,
  background: '#fff',
  color: '#0f172a',
  padding: '8px 10px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

const iconButtonBaseStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 12,
  border: '1px solid rgba(148, 163, 184, 0.24)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'transform 120ms ease, background-color 120ms ease, border-color 120ms ease',
  backdropFilter: 'blur(16px)',
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
};

const toggleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  fontSize: 14,
  color: '#0f172a',
};

const iconSize = 18;

function ZoomInIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M11 8.25v5.5M8.25 11h5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ZoomOutIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M8.25 11h5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FitViewIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 4H4v4M16 4h4v4M8 20H4v-4M20 20h-4v-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="8" y="8" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="m8 10 4 4 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DarkModeIcon({ active }: { readonly active: boolean }) {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {active ? (
        <>
          <path
            d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
        </>
      ) : (
        <path
          d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1 0 2.8 2 2 0 0 1-2.8 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 0 1-2.8 0 2 2 0 0 1 0-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 0 1 0-2.8 2 2 0 0 1 2.8 0l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 0 1 2.8 0 2 2 0 0 1 0 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.2a1 1 0 0 0-.9.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StageNavigationIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 5v14M15.5 5v14" stroke="currentColor" strokeWidth="1.4" opacity="0.72" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    </svg>
  );
}

const areStringArraysEqual = (left: readonly string[], right: readonly string[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
};

const areSearchResultsEqual = (left: GraphSearchResults, right: GraphSearchResults): boolean => {
  return (
    areStringArraysEqual(left.nodeIds, right.nodeIds) &&
    areStringArraysEqual(left.edgeIds, right.edgeIds)
  );
};

const areViewportsEqual = (left: GraphViewport, right: GraphViewport): boolean => {
  return left.x === right.x && left.y === right.y && left.zoom === right.zoom;
};

const getAncestryHighlight = (
  graph: NxGraphInput,
  results: GraphSearchResults
): GraphSearchResults => {
  const reverse = new Map<string, Array<{ source: string; edgeId: string }>>();
  for (const [source, targets] of Object.entries(graph.adj)) {
    for (const [target, rawAttrs] of Object.entries(targets)) {
      const edgeList = Array.isArray(rawAttrs) ? rawAttrs : [rawAttrs];
      for (const [index, attrs] of edgeList.entries()) {
        const edgeId = attrs?.id ?? `${source}-${target}-${index}`;
        reverse.set(target, [...(reverse.get(target) ?? []), { source, edgeId }]);
      }
    }
  }

  const nodeIds = new Set(results.nodeIds);
  const edgeIds = new Set(results.edgeIds);
  const stack = [...results.nodeIds];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    for (const { source, edgeId } of reverse.get(current) ?? []) {
      if (!nodeIds.has(source)) {
        nodeIds.add(source);
        stack.push(source);
      }
      edgeIds.add(edgeId);
    }
  }

  return {
    nodeIds: [...nodeIds],
    edgeIds: [...edgeIds],
  };
};

const serializeSvg = (container: HTMLDivElement | null): void => {
  if (!container) {
    return;
  }

  const svgElement = container.querySelector('svg');
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
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const mergeBounds = (
  current: {
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
    readonly width: number;
    readonly height: number;
  } | null,
  next: {
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
    readonly width: number;
    readonly height: number;
  } | null
) => {
  if (!current) {
    return next;
  }

  if (!next) {
    return current;
  }

  const minX = Math.min(current.minX, next.minX);
  const minY = Math.min(current.minY, next.minY);
  const maxX = Math.max(current.maxX, next.maxX);
  const maxY = Math.max(current.maxY, next.maxY);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const getLabelBounds = (
  nodes: readonly PositionedNode[],
  labels: readonly string[],
  labelOffset: number,
  layout: GraphConfig['layout'],
  layoutDirection: GraphConfig['layoutDirection']
) => {
  if (nodes.length === 0 || labels.length === 0) {
    return null;
  }

  const columns = new Map<number, PositionedNode[]>();
  for (const node of nodes) {
    const column = columns.get(node.position.x) ?? [];
    column.push(node);
    columns.set(node.position.x, column);
  }

  const xs = [...columns.keys()].sort((a, b) => a - b);
  const orderedXs =
    layout === LayoutType.Tree && layoutDirection === LayoutDirection.RTL ? [...xs].reverse() : xs;
  const minY = Math.min(...nodes.map((node) => node.position.y));
  const topY = minY - labelOffset - LABEL_PILL_HEIGHT + 6;

  return orderedXs.reduce<ReturnType<typeof mergeBounds>>((bounds, x) => {
    const nodeWidth = columns.get(x)?.[0]?.size?.width ?? 0;
    const centerX = x + nodeWidth / 2;
    return mergeBounds(bounds, {
      minX: centerX - LABEL_PILL_WIDTH / 2,
      minY: topY,
      maxX: centerX + LABEL_PILL_WIDTH / 2,
      maxY: topY + LABEL_PILL_HEIGHT,
      width: LABEL_PILL_WIDTH,
      height: LABEL_PILL_HEIGHT,
    });
  }, null);
};

interface StoryContentBounds {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
}

const STORY_DEFAULT_ZOOM = 1;

const getStoryContentBounds = (
  graph: NxGraphInput,
  config: GraphConfig,
  labels: readonly string[]
): StoryContentBounds | null => {
  const { nodes, edges } = fromNxGraph(graph, config.defaultEdgeType);
  const positionedNodes = layoutNodes({
    nodes,
    edges,
    theme: config.theme,
    padding: config.padding,
    layout: config.layout,
    width: config.width,
    height: config.height,
    layoutDirection: config.layoutDirection,
    nodeSizing: config.nodeSizing,
    fixedNodeSize: config.fixedNodeSize,
    labelMeasurementPaddingX: config.labelMeasurementPaddingX,
    labelMeasurementPaddingY: config.labelMeasurementPaddingY,
    labelMeasurementCharWidth: config.labelMeasurementCharWidth,
    labelMeasurementLineHeight: config.labelMeasurementLineHeight,
  });

  const nodeBounds = positionedNodes.reduce<ReturnType<typeof mergeBounds>>((bounds, node) => {
    const nodeWidth = node.size?.width ?? config.fixedNodeSize?.width ?? NODE_DIMENSIONS.WIDTH;
    const nodeHeight = node.size?.height ?? config.fixedNodeSize?.height ?? NODE_DIMENSIONS.HEIGHT;

    return mergeBounds(bounds, {
      minX: node.position.x,
      minY: node.position.y,
      maxX: node.position.x + nodeWidth,
      maxY: node.position.y + nodeHeight,
      width: nodeWidth,
      height: nodeHeight,
    });
  }, null);

  const contentBounds = mergeBounds(
    nodeBounds,
    getLabelBounds(
      positionedNodes,
      labels,
      config.labelOffset ?? 40,
      config.layout,
      config.layoutDirection
    )
  );

  if (!contentBounds) {
    return null;
  }

  return {
    minX: contentBounds.minX,
    minY: contentBounds.minY,
    maxX: contentBounds.maxX,
    maxY: contentBounds.maxY,
    width: contentBounds.width,
    height: contentBounds.height,
  };
};

const getViewportForStoryBounds = (
  bounds: StoryContentBounds,
  width: number,
  height: number,
  zoom: number
): GraphViewport => {
  const availableWidth = Math.max(width - FIT_PADDING.left - FIT_PADDING.right, 1);
  const availableHeight = Math.max(height - FIT_PADDING.top - FIT_PADDING.bottom, 1);

  return {
    x: FIT_PADDING.left + (availableWidth - bounds.width * zoom) / 2 - bounds.minX * zoom,
    y: FIT_PADDING.top + (availableHeight - bounds.height * zoom) / 2 - bounds.minY * zoom,
    zoom,
  };
};

const getStoryViewportAtZoom = (
  graph: NxGraphInput,
  config: GraphConfig,
  labels: readonly string[],
  width: number,
  height: number,
  zoom: number
): GraphViewport => {
  const bounds = getStoryContentBounds(graph, config, labels);
  if (!bounds) {
    return INITIAL_VIEWPORT;
  }

  return getViewportForStoryBounds(bounds, width, height, zoom);
};

const getFitViewportForStory = (
  graph: NxGraphInput,
  config: GraphConfig,
  labels: readonly string[],
  width: number,
  height: number,
  minZoom: number,
  maxZoom: number
): GraphViewport => {
  const bounds = getStoryContentBounds(graph, config, labels);
  if (!bounds) {
    return INITIAL_VIEWPORT;
  }

  const availableWidth = Math.max(width - FIT_PADDING.left - FIT_PADDING.right, 1);
  const availableHeight = Math.max(height - FIT_PADDING.top - FIT_PADDING.bottom, 1);
  const zoom = Math.min(
    maxZoom,
    Math.max(minZoom, Math.min(availableWidth / bounds.width, availableHeight / bounds.height))
  );

  return getViewportForStoryBounds(bounds, width, height, zoom);
};

const getStageViewsForStory = (
  graph: NxGraphInput,
  config: GraphConfig,
  labels: readonly string[]
): readonly StageView[] => {
  const { nodes, edges } = fromNxGraph(graph, config.defaultEdgeType);
  const positionedNodes = layoutNodes({
    nodes,
    edges,
    theme: config.theme,
    padding: config.padding,
    layout: config.layout,
    width: config.width,
    height: config.height,
    layoutDirection: config.layoutDirection,
    nodeSizing: config.nodeSizing,
    fixedNodeSize: config.fixedNodeSize,
    labelMeasurementPaddingX: config.labelMeasurementPaddingX,
    labelMeasurementPaddingY: config.labelMeasurementPaddingY,
    labelMeasurementCharWidth: config.labelMeasurementCharWidth,
    labelMeasurementLineHeight: config.labelMeasurementLineHeight,
  });

  return buildStageViews(positionedNodes, labels, config.labelOffset ?? 40);
};

export function BracketPlayground({
  graph,
  layout = LayoutType.Tree,
  layoutDirection = LayoutDirection.LTR,
  routingStyle = 'orthogonal',
  curveEdges = true,
  nodeSizing = 'fixed',
  selectionMode = 'multiple',
  renderMode = SquashNodeRenderMode.Export,
  isCompact = false,
  highlightMode = 'ancestry',
  hideUnmatchedSearch = false,
  marqueeSelectionEnabled = true,
  hoverHighlight = false,
  showViewportControls = true,
  searchQuery = '',
  isDarkMode = false,
}: BracketPlaygroundProps) {
  const graphRef = useRef<GraphHandle | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isStageNavigationMode, setIsStageNavigationMode] = useState(false);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
  const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS_SIZE);
  const [viewport, setViewport] = useState<GraphViewport>(INITIAL_VIEWPORT);
  const [selection, setSelection] = useState<GraphSelection>(EMPTY_SELECTION);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<GraphSearchResults>(EMPTY_SELECTION);
  const [hoverState, setHoverState] = useState<HoverState>(null);
  const [clickedNode, setClickedNode] = useState<PositionedNode | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    'Double-click a match to collapse or expand its subtree.'
  );
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [verticalStagePosition, setVerticalStagePosition] = useState<VerticalStagePosition>(
    VerticalStagePosition.Top
  );
  const [canPagePlayersVertically, setCanPagePlayersVertically] = useState(false);
  const previousViewportRef = useRef<GraphViewport | null>(null);
  /** Always-up-to-date viewport for use in event handlers (avoids stale closures). */
  const liveViewportRef = useRef<GraphViewport>(INITIAL_VIEWPORT);

  /** Non-compact SVG layout needs NODE_DIMENSIONS; tiny fixed sizes would overlap glyphs. */
  const activeNodeSize = useMemo(
    () =>
      isCompact
        ? { width: NODE_DIMENSIONS_STAGE_NAV.WIDTH, height: NODE_DIMENSIONS_STAGE_NAV.HEIGHT }
        : { width: NODE_DIMENSIONS.WIDTH, height: NODE_DIMENSIONS.HEIGHT },
    [isCompact]
  );

  const enrichedGraph = useMemo(() => {
    const withPaths = injectTournamentPathKeys(graph);
    return {
      ...withPaths,
      nodes: Object.fromEntries(
        Object.entries(withPaths.nodes ?? {}).map(([id, attrs]) => [
          id,
          { ...attrs, size: activeNodeSize },
        ])
      ),
    };
  }, [graph, activeNodeSize]);
  const labels = useMemo(() => roundLabelsForGraph(graph), [graph]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof ResizeObserver === 'undefined') {
      return;
    }

    const updateSize = () => {
      const nextWidth = Math.max(720, Math.floor(element.clientWidth));
      const nextHeight = Math.max(560, Math.floor(element.clientHeight));

      setCanvasSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight }
      );
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const bracketStorySpacing = useMemo(() => {
    // Tree layout uses one gap between siblings (same round) and between levels (round → round).
    const gapPx = isCompact ? 14 : 34;
    return { nodeGap: gapPx, edgeSeparation: gapPx };
  }, [isCompact]);

  const vertexComponent = useMemo<VertexComponent>(
    () => (props: VertexComponentProps) =>
      React.createElement(SquashNode as React.ComponentType<any>, {
        ...props,
        renderMode,
        compact: isCompact,
      }),
    [renderMode, isCompact]
  );

  const config = useMemo<GraphConfig>(() => {
    const dark = isDarkMode;
    const baseTheme = dark ? DARK_THEME : LIGHT_THEME;
    return {
      layout,
      layoutDirection,
      width: canvasSize.width,
      height: canvasSize.height,
      padding: BRACKET_STORY_LAYOUT_PADDING,
      defaultEdgeType: EdgeType.Undirected,
      curveEdges,
      curveStrength: 0.2,
      forceRightToLeft: true,
      hoverHighlight,
      hoverEdgeColor: dark ? '#5d6470' : '#d9d6cf',
      hoverNodeInColor: dark ? '#9ab08d' : '#7c9070',
      hoverNodeOutColor: dark ? '#9ab08d' : '#7c9070',
      hoverNodeBothColor: dark ? '#9ab08d' : '#7c9070',
      theme: {
        ...baseTheme,
        nodeGap: bracketStorySpacing.nodeGap,
      },
      labelOffset: 40,
      labels: isStageNavigationMode ? undefined : labels,
      routingStyle,
      edgeSeparation: bracketStorySpacing.edgeSeparation,
      selfLoopRadius: 34,
      nodeSizing,
      fixedNodeSize: activeNodeSize,
      edgeLabelColor: dark ? '#e2e8f0' : '#334155',
      labelPillBackground: 'transparent',
      labelPillBorderColor: 'transparent',
      labelPillTextColor: dark ? '#d8d2c7' : '#444b55',
    };
  }, [
    activeNodeSize,
    bracketStorySpacing,
    canvasSize.height,
    canvasSize.width,
    curveEdges,
    hoverHighlight,
    isDarkMode,
    isStageNavigationMode,
    labels,
    layout,
    layoutDirection,
    nodeSizing,
    routingStyle,
  ]);

  const stageViews = useMemo(
    () => getStageViewsForStory(enrichedGraph, config, labels),
    [config, enrichedGraph, labels]
  );

  const translateExtent = useMemo((): [[number, number], [number, number]] | undefined => {
    if (stageViews.length === 0) return undefined;
    const pad = 64;
    const minX = Math.min(...stageViews.map((s) => s.bounds.minX)) - pad;
    const minY = Math.min(...stageViews.map((s) => s.bounds.minY)) - pad;
    const maxX = Math.max(...stageViews.map((s) => s.bounds.maxX)) + pad;
    const maxY = Math.max(...stageViews.map((s) => s.bounds.maxY)) + pad;
    return [
      [minX, minY],
      [maxX, maxY],
    ];
  }, [stageViews]);

  const computedMinZoom = useMemo(() => {
    if (stageViews.length === 0 || !canvasSize.width || !canvasSize.height) return 0.05;
    if (!isCompact && !isStageNavigationMode) {
      return 0.05;
    }
    // Use the same computation as getFitViewportForStory so minZoom == fit zoom.
    // This prevents normalizeViewport from clamping the fit viewport's zoom.
    const fitViewport = getFitViewportForStory(
      enrichedGraph,
      config,
      labels,
      canvasSize.width,
      canvasSize.height,
      0.05,
      3
    );
    return Math.max(0.05, fitViewport.zoom);
  }, [canvasSize, config, enrichedGraph, isCompact, isStageNavigationMode, labels, stageViews]);

  // Sync canvasSize to the actual container before the first browser paint.
  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const w = Math.max(720, Math.floor(element.clientWidth));
    const h = Math.max(560, Math.floor(element.clientHeight));
    setCanvasSize((prev) =>
      prev.width === w && prev.height === h ? prev : { width: w, height: h }
    );
  }, []);

  // Apply fit viewport as soon as canvasSize matches the real container dims.
  // Runs synchronously before the first paint so there is no visible flash.
  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element || !graphRef.current) return;
    const realW = Math.max(720, Math.floor(element.clientWidth));
    const realH = Math.max(560, Math.floor(element.clientHeight));
    // Guard: skip until the first useLayoutEffect has flushed the correct canvasSize.
    if (canvasSize.width !== realW || canvasSize.height !== realH) return;
    const nextViewport =
      !isCompact && !isStageNavigationMode
        ? getStoryViewportAtZoom(enrichedGraph, config, labels, realW, realH, STORY_DEFAULT_ZOOM)
        : getFitViewportForStory(enrichedGraph, config, labels, realW, realH, 0.05, 3);
    graphRef.current.setViewport(nextViewport);
    liveViewportRef.current = nextViewport;
    setViewport(nextViewport);
  }, [canvasSize, config, enrichedGraph, isCompact, isStageNavigationMode, labels]);

  const handleViewportChange = useCallback((nextViewport: GraphViewport) => {
    liveViewportRef.current = nextViewport;
    setViewport((current) => (areViewportsEqual(current, nextViewport) ? current : nextViewport));
  }, []);

  const handleSearchResultsChange = useCallback((nextResults: GraphSearchResults) => {
    setSearchResults((current) =>
      areSearchResultsEqual(current, nextResults) ? current : nextResults
    );
  }, []);

  const handleNodeClick = useCallback((node: PositionedNode) => {
    setClickedNode(node);
    setFocusedNodeId(node.id);
    setSelection({ nodeIds: [node.id], edgeIds: [] });
    setStatusMessage(`Clicked match ${node.id}. Node info is shown in the output panel.`);
    console.log('[BracketPlayground] Node clicked:', node);
  }, []);

  const handleStoryFit = useCallback(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const nextViewport = getFitViewportForStory(
      enrichedGraph,
      config,
      labels,
      Math.max(1, element.clientWidth),
      Math.max(1, element.clientHeight),
      0.05,
      3
    );

    graphRef.current?.setViewport?.(nextViewport);
    setViewport(nextViewport);
  }, [config, enrichedGraph, labels]);

  const focusStage = useCallback(
    (stageIndex: number) => {
      const stage = stageViews[stageIndex];
      const element = containerRef.current;
      if (!stage || !element) {
        return;
      }

      const isLastStage = stageIndex === stageViews.length - 1;
      // Show only 3 items vertically so the zoom is tight on mobile.
      const visibleItems = 3;
      const itemH = activeNodeSize.height;
      const gap = bracketStorySpacing.nodeGap;
      const targetWorldHeight = visibleItems * itemH + (visibleItems - 1) * gap;
      const nextStageViewport = getStageViewport(
        stage.bounds,
        Math.max(1, element.clientWidth),
        Math.max(1, element.clientHeight),
        isLastStage ? VerticalStagePosition.Center : verticalStagePosition,
        targetWorldHeight
      );

      setCanPagePlayersVertically(nextStageViewport.canPageVertically);
      graphRef.current?.setViewport?.(nextStageViewport.viewport);
      liveViewportRef.current = nextStageViewport.viewport;
      setViewport(nextStageViewport.viewport);
    },
    [bracketStorySpacing, stageViews, verticalStagePosition, activeNodeSize.height]
  );

  const handleToggleStageNavigationMode = useCallback(() => {
    if (isStageNavigationMode) {
      const previousViewport = previousViewportRef.current;
      if (previousViewport) {
        graphRef.current?.setViewport?.(previousViewport);
        liveViewportRef.current = previousViewport;
        setViewport(previousViewport);
      } else {
        handleStoryFit();
      }
      setIsStageNavigationMode(false);
      setStatusMessage('Exited stage navigation mode.');
      return;
    }

    previousViewportRef.current = viewport;
    setVerticalStagePosition(VerticalStagePosition.Top);
    setActiveStageIndex(0);
    setIsStageNavigationMode(true);
    setStatusMessage(
      'Stage navigation mode active. Use the arrows or stage chips to move between rounds.'
    );
  }, [handleStoryFit, isStageNavigationMode, viewport]);

  useEffect(() => {
    setActiveStageIndex((current) => Math.min(current, Math.max(stageViews.length - 1, 0)));
  }, [stageViews.length]);

  useEffect(() => {
    if (!isStageNavigationMode || stageViews.length === 0) {
      return;
    }

    focusStage(activeStageIndex);
  }, [activeStageIndex, focusStage, isStageNavigationMode, stageViews.length]);

  const handlePreviousStage = useCallback(() => {
    setVerticalStagePosition(VerticalStagePosition.Top);
    setActiveStageIndex((current) => Math.max(current - 1, 0));
  }, []);

  const handleNextStage = useCallback(() => {
    setVerticalStagePosition(VerticalStagePosition.Top);
    setActiveStageIndex((current) => Math.min(current + 1, stageViews.length - 1));
  }, [stageViews.length]);

  const handlePagePlayersUp = useCallback(() => {
    setVerticalStagePosition(VerticalStagePosition.Top);
  }, []);

  const handlePagePlayersDown = useCallback(() => {
    setVerticalStagePosition(VerticalStagePosition.Bottom);
  }, []);

  // ── Vertical scroll (mouse wheel) in slide mode ────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isStageNavigationMode) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
      const cur = liveViewportRef.current;
      const next = { ...cur, y: cur.y - delta };
      liveViewportRef.current = next;
      graphRef.current?.setViewport?.(next);
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [isStageNavigationMode]);

  // ── Touch: vertical drag to scroll, horizontal swipe to change stage ───────
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isStageNavigationMode) return;

    let startX = 0;
    let startY = 0;
    let lastY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      lastY = startY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);
      // Only prevent default for vertical scroll (not horizontal swipe)
      if (dy > dx) {
        e.preventDefault();
        const moveY = e.touches[0].clientY - lastY;
        lastY = e.touches[0].clientY;
        const cur = liveViewportRef.current;
        const next = { ...cur, y: cur.y + moveY };
        liveViewportRef.current = next;
        graphRef.current?.setViewport?.(next);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - startX;
      const dy = endY - startY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) handleNextStage();
        else handlePreviousStage();
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleNextStage, handlePreviousStage, isStageNavigationMode]);

  // ── Mouse drag: vertical drag to scroll in slide mode ────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isStageNavigationMode) return;

    let isDragging = false;
    let lastMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      // Only primary button; ignore clicks on buttons/inputs
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest('button, input, select, a')) return;
      isDragging = true;
      lastMouseY = e.clientY;
      container.style.cursor = 'grabbing';
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dy = e.clientY - lastMouseY;
      lastMouseY = e.clientY;
      const cur = liveViewportRef.current;
      const next = { ...cur, y: cur.y + dy };
      liveViewportRef.current = next;
      graphRef.current?.setViewport?.(next);
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      container.style.cursor = 'grab';
    };

    container.style.cursor = 'grab';
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      container.style.cursor = '';
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isStageNavigationMode]);

  return (
    <BracketAppearanceProvider isDarkMode={isDarkMode} compact={isCompact}>
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: isDarkMode ? '#020617' : '#f8fafc',
          color: isDarkMode ? '#e2e8f0' : '#0f172a',
        }}
      >
        <main
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            padding: BRACKET_STORY_OUTER_PADDING,
            boxSizing: 'border-box',
          }}
        >
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: '100%',
              height: `calc(100vh - ${BRACKET_STORY_OUTER_PADDING * 2}px)`,
              minHeight: 640,
              borderRadius: 18,
              overflow: 'hidden',
              border: `1px solid ${isDarkMode ? 'rgba(148,163,184,0.14)' : 'rgba(15,23,42,0.08)'}`,
              boxShadow: isDarkMode
                ? '0 18px 60px rgba(0,0,0,0.35)'
                : '0 18px 60px rgba(15,23,42,0.10)',
              background: isDarkMode ? '#020617' : '#ffffff',
            }}
          >
            <Graph
              ref={graphRef}
              graph={enrichedGraph}
              vertexComponent={vertexComponent}
              config={config}
              defaultViewport={INITIAL_VIEWPORT}
              onViewportChange={handleViewportChange}
              fitViewPadding={BRACKET_STORY_FIT_VIEW_PADDING}
              minZoom={computedMinZoom}
              maxZoom={isStageNavigationMode ? 5 : 3}
              zoomStep={0.12}
              translateExtent={isStageNavigationMode ? undefined : translateExtent}
              panEnabled={!isStageNavigationMode}
              zoomEnabled={!isStageNavigationMode}
              pinchZoomEnabled={!isStageNavigationMode}
              selectionMode={selectionMode}
              nodeSelectionEnabled={false}
              edgeSelectionEnabled={false}
              selectedNodeIds={selection.nodeIds}
              selectedEdgeIds={selection.edgeIds}
              onSelectionChange={setSelection}
              showControls={false}
              marqueeSelectionEnabled={marqueeSelectionEnabled}
              focusedNodeId={null}
              onFocusedNodeChange={() => undefined}
              collapsedNodeIds={collapsedNodeIds}
              onCollapsedNodeIdsChange={setCollapsedNodeIds}
              onNodeCollapse={(nodeId: string) =>
                setStatusMessage(`Collapsed subtree for ${nodeId}.`)
              }
              onNodeExpand={(nodeId: string) => setStatusMessage(`Expanded subtree for ${nodeId}.`)}
              searchQuery={searchQuery}
              hideUnmatchedSearch={hideUnmatchedSearch}
              highlightColor="#f59e0b"
              highlightStrategy={
                highlightMode === 'ancestry'
                  ? ({
                      matchedNodeIds,
                      matchedEdgeIds,
                    }: {
                      matchedNodeIds: string[];
                      matchedEdgeIds: string[];
                    }) =>
                      getAncestryHighlight(enrichedGraph, {
                        nodeIds: matchedNodeIds,
                        edgeIds: matchedEdgeIds,
                      })
                  : undefined
              }
              onSearchResultsChange={handleSearchResultsChange}
              onNodeClick={handleNodeClick}
              routeEdgesOverride={routeBracketEdges}
              onNodeHoverChange={(node: PositionedNode, hovered: boolean) => {
                setHoverState(hovered ? { kind: 'node', id: node.id } : null);
              }}
              onEdgeHoverChange={(edge: PositionedEdge, hovered: boolean) => {
                setHoverState(hovered ? { kind: 'edge', id: edge.id } : null);
              }}
            />
            {showViewportControls ? (
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  zIndex: 2,
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: 18,
                  background: isDarkMode ? 'rgba(15, 23, 42, 0.84)' : 'rgba(255, 255, 255, 0.82)',
                  border: `1px solid ${
                    isDarkMode ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.2)'
                  }`,
                  backdropFilter: 'blur(18px)',
                  boxShadow: isDarkMode
                    ? '0 16px 40px rgba(2, 6, 23, 0.45)'
                    : '0 16px 40px rgba(15, 23, 42, 0.14)',
                }}
              >
                <button
                  type="button"
                  aria-label={isToolbarExpanded ? 'Collapse controls' : 'Expand controls'}
                  title={isToolbarExpanded ? 'Collapse controls' : 'Expand controls'}
                  onClick={() => setIsToolbarExpanded((current) => !current)}
                  style={{
                    ...iconButtonBaseStyle,
                    background: isDarkMode ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                    color: isDarkMode ? '#e2e8f0' : '#0f172a',
                    borderColor: isDarkMode
                      ? 'rgba(148, 163, 184, 0.2)'
                      : 'rgba(148, 163, 184, 0.22)',
                  }}
                >
                  <SettingsIcon />
                </button>
                <button
                  type="button"
                  aria-label={
                    isStageNavigationMode
                      ? 'Exit stage navigation mode'
                      : 'Enter stage navigation mode'
                  }
                  title={
                    isStageNavigationMode
                      ? 'Exit stage navigation mode'
                      : 'Enter stage navigation mode'
                  }
                  onClick={handleToggleStageNavigationMode}
                  style={{
                    ...iconButtonBaseStyle,
                    background: isDarkMode ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                    color: isStageNavigationMode
                      ? isDarkMode
                        ? '#cfe3c1'
                        : '#516347'
                      : isDarkMode
                        ? '#e2e8f0'
                        : '#0f172a',
                    borderColor: isDarkMode
                      ? 'rgba(148, 163, 184, 0.2)'
                      : 'rgba(148, 163, 184, 0.22)',
                    boxShadow: isStageNavigationMode
                      ? isDarkMode
                        ? '0 10px 24px rgba(124, 144, 112, 0.28)'
                        : '0 10px 24px rgba(124, 144, 112, 0.2)'
                      : iconButtonBaseStyle.boxShadow,
                  }}
                >
                  <StageNavigationIcon />
                </button>
                {isToolbarExpanded
                  ? [
                      {
                        key: 'zoom-in',
                        title: 'Zoom in',
                        icon: <ZoomInIcon />,
                        onClick: () => graphRef.current?.zoomIn?.(),
                      },
                      {
                        key: 'zoom-out',
                        title: 'Zoom out',
                        icon: <ZoomOutIcon />,
                        onClick: () => graphRef.current?.zoomOut?.(),
                      },
                      {
                        key: 'fit-view',
                        title: 'Fit view',
                        icon: <FitViewIcon />,
                        onClick: handleStoryFit,
                      },
                      {
                        key: 'export-svg',
                        title: 'Download SVG',
                        icon: <DownloadIcon />,
                        onClick: () => serializeSvg(containerRef.current),
                      },
                    ].map((control) => (
                      <button
                        key={control.key}
                        type="button"
                        aria-label={control.title}
                        title={control.title}
                        onClick={control.onClick}
                        style={{
                          ...iconButtonBaseStyle,
                          background: isDarkMode
                            ? 'rgba(30, 41, 59, 0.96)'
                            : 'rgba(255, 255, 255, 0.96)',
                          color:
                            control.key === 'stage-navigation' && isStageNavigationMode
                              ? isDarkMode
                                ? '#cfe3c1'
                                : '#516347'
                              : isDarkMode
                                ? '#e2e8f0'
                                : '#0f172a',
                          borderColor: isDarkMode
                            ? 'rgba(148, 163, 184, 0.2)'
                            : 'rgba(148, 163, 184, 0.22)',
                          boxShadow:
                            control.key === 'stage-navigation' && isStageNavigationMode
                              ? isDarkMode
                                ? '0 10px 24px rgba(124, 144, 112, 0.28)'
                                : '0 10px 24px rgba(124, 144, 112, 0.2)'
                              : iconButtonBaseStyle.boxShadow,
                        }}
                      >
                        {control.icon}
                      </button>
                    ))
                  : null}
              </div>
            ) : null}

            {isStageNavigationMode && stageViews.length > 0 ? (
              <>
                {/* Top carousel: current stage name + prev/next arrows */}
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 0,
                    alignItems: 'center',
                    padding: '4px',
                    borderRadius: 999,
                    border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.22)'}`,
                    background: isDarkMode ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.96)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: isDarkMode
                      ? '0 10px 30px rgba(2, 6, 23, 0.45)'
                      : '0 10px 30px rgba(15, 23, 42, 0.12)',
                    zIndex: 3,
                  }}
                >
                  <button
                    type="button"
                    aria-label="Previous stage"
                    onClick={handlePreviousStage}
                    disabled={activeStageIndex === 0}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      border: 'none',
                      background: 'transparent',
                      color: isDarkMode ? '#e2e8f0' : '#0f172a',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: activeStageIndex === 0 ? 'default' : 'pointer',
                      opacity: activeStageIndex === 0 ? 0.3 : 1,
                      flexShrink: 0,
                      fontSize: 18,
                    }}
                  >
                    ‹
                  </button>

                  <span
                    style={{
                      padding: '5px 14px',
                      borderRadius: 999,
                      background: '#7c9070',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                      userSelect: 'none',
                      minWidth: 100,
                      textAlign: 'center',
                    }}
                  >
                    {stageViews[activeStageIndex]?.label ?? ''}
                  </span>

                  {stageViews.length > 1 ? (
                    <span
                      style={{
                        fontSize: 10,
                        color: isDarkMode ? '#64748b' : '#94a3b8',
                        padding: '0 4px 0 2px',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {activeStageIndex + 1}/{stageViews.length}
                    </span>
                  ) : null}

                  <button
                    type="button"
                    aria-label="Next stage"
                    onClick={handleNextStage}
                    disabled={activeStageIndex >= stageViews.length - 1}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      border: 'none',
                      background: 'transparent',
                      color: isDarkMode ? '#e2e8f0' : '#0f172a',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: activeStageIndex >= stageViews.length - 1 ? 'default' : 'pointer',
                      opacity: activeStageIndex >= stageViews.length - 1 ? 0.3 : 1,
                      flexShrink: 0,
                      fontSize: 18,
                    }}
                  >
                    ›
                  </button>
                </div>

                {/* Side arrows for stage navigation */}
                {stageViews.length > 1 ? (
                  <>
                    <button
                      type="button"
                      aria-label="Previous stage"
                      onClick={handlePreviousStage}
                      disabled={activeStageIndex === 0}
                      style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        ...iconButtonBaseStyle,
                        background: isDarkMode
                          ? 'rgba(30, 41, 59, 0.96)'
                          : 'rgba(255, 255, 255, 0.96)',
                        color: isDarkMode ? '#e2e8f0' : '#0f172a',
                        opacity: activeStageIndex === 0 ? 0.45 : 1,
                        cursor: activeStageIndex === 0 ? 'default' : 'pointer',
                        zIndex: 2,
                      }}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      aria-label="Next stage"
                      onClick={handleNextStage}
                      disabled={activeStageIndex >= stageViews.length - 1}
                      style={{
                        position: 'absolute',
                        right: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        ...iconButtonBaseStyle,
                        background: isDarkMode
                          ? 'rgba(30, 41, 59, 0.96)'
                          : 'rgba(255, 255, 255, 0.96)',
                        color: isDarkMode ? '#e2e8f0' : '#0f172a',
                        opacity: activeStageIndex >= stageViews.length - 1 ? 0.45 : 1,
                        cursor: activeStageIndex >= stageViews.length - 1 ? 'default' : 'pointer',
                        zIndex: 2,
                      }}
                    >
                      →
                    </button>
                  </>
                ) : null}

                {canPagePlayersVertically ? (
                  <div
                    style={{
                      position: 'absolute',
                      right: 14,
                      bottom: 86,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      zIndex: 2,
                    }}
                  >
                    <button
                      type="button"
                      aria-label="Show upper players"
                      onClick={handlePagePlayersUp}
                      disabled={verticalStagePosition === VerticalStagePosition.Top}
                      style={{
                        ...iconButtonBaseStyle,
                        background: isDarkMode
                          ? 'rgba(30, 41, 59, 0.96)'
                          : 'rgba(255, 255, 255, 0.96)',
                        color: isDarkMode ? '#e2e8f0' : '#0f172a',
                        opacity: verticalStagePosition === VerticalStagePosition.Top ? 0.45 : 1,
                        cursor:
                          verticalStagePosition === VerticalStagePosition.Top
                            ? 'default'
                            : 'pointer',
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Show lower players"
                      onClick={handlePagePlayersDown}
                      disabled={verticalStagePosition === VerticalStagePosition.Bottom}
                      style={{
                        ...iconButtonBaseStyle,
                        background: isDarkMode
                          ? 'rgba(30, 41, 59, 0.96)'
                          : 'rgba(255, 255, 255, 0.96)',
                        color: isDarkMode ? '#e2e8f0' : '#0f172a',
                        opacity: verticalStagePosition === VerticalStagePosition.Bottom ? 0.45 : 1,
                        cursor:
                          verticalStagePosition === VerticalStagePosition.Bottom
                            ? 'default'
                            : 'pointer',
                      }}
                    >
                      ↓
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </main>
      </div>
    </BracketAppearanceProvider>
  );
}

export default BracketPlayground;
