import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  EdgeType,
  fromNxGraph,
  Graph,
  GraphConfig,
  GraphSearchResults,
  GraphSelection,
  GraphViewport,
  LayoutDirection,
  LayoutType,
  layoutNodes,
  NxGraphInput,
  PositionedEdge,
  PositionedNode,
  VertexComponent,
  VertexComponentProps,
} from '@graph-render/react';
import {
  BracketThemeProvider,
  injectTournamentPathKeys,
  SquashNode,
  roundLabelsForGraph,
} from '@graph-render/tournament-tree';

export interface BracketPlaygroundProps {
  graph: NxGraphInput;
}

type HighlightMode = 'match' | 'ancestry';
type HoverState = { kind: 'node' | 'edge'; id: string } | null;
type SquashNodeRenderMode = 'svg' | 'html' | 'export' | 'server';

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
const StoryGraph = Graph as unknown as React.ComponentType<any>;
const DEFAULT_CANVAS_SIZE = { width: 1200, height: 900 };
const LABEL_PILL_WIDTH = 64;
const LABEL_PILL_HEIGHT = 20;
const NAVIGATION_STAGE_PADDING_X = 52;
const NAVIGATION_STAGE_PADDING_Y = 44;
const NAVIGATION_STAGE_MIN_WIDTH = 420;
const NAVIGATION_STAGE_MIN_HEIGHT = 250;
const NAVIGATION_MIN_ZOOM = 0.45;
const NAVIGATION_MAX_ZOOM = 2.1;
const FIT_PADDING = {
  top: 48,
  right: 24,
  bottom: 120,
  left: 24,
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

const ZoomInIcon = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M11 8.25v5.5M8.25 11h5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M8.25 11h5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const FitViewIcon = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M8 4H4v4M16 4h4v4M8 20H4v-4M20 20h-4v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="8" y="8" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const DownloadIcon = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 4v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="m8 10 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const DarkModeIcon = ({ active }: { active: boolean }) => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {active ? (
      <>
        <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
      </>
    ) : (
      <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    )}
  </svg>
);

const SettingsIcon = () => (
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

const StageNavigationIcon = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8.5 5v14M15.5 5v14" stroke="currentColor" strokeWidth="1.4" opacity="0.72" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
  </svg>
);

type StageView = {
  index: number;
  label: string;
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
};

type VerticalStagePosition = 'top' | 'bottom';

type StageViewportResult = {
  viewport: GraphViewport;
  canPageVertically: boolean;
};

const areStringArraysEqual = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
};

const areSearchResultsEqual = (
  left: GraphSearchResults,
  right: GraphSearchResults
): boolean => {
  return (
    areStringArraysEqual(left.nodeIds, right.nodeIds) &&
    areStringArraysEqual(left.edgeIds, right.edgeIds)
  );
};

const areViewportsEqual = (left: GraphViewport, right: GraphViewport): boolean => {
  return left.x === right.x && left.y === right.y && left.zoom === right.zoom;
};

const getAncestryHighlight = (graph: NxGraphInput, results: GraphSearchResults): GraphSearchResults => {
  const reverse = new Map<string, Array<{ source: string; edgeId: string }>>();
  Object.entries(graph.adj).forEach(([source, targets]) => {
    Object.entries(targets).forEach(([target, rawAttrs]) => {
      const edgeList = Array.isArray(rawAttrs) ? rawAttrs : [rawAttrs];
      edgeList.forEach((attrs, index) => {
        const edgeId = attrs?.id ?? `${source}-${target}-${index}`;
        reverse.set(target, [...(reverse.get(target) ?? []), { source, edgeId }]);
      });
    });
  });

  const nodeIds = new Set(results.nodeIds);
  const edgeIds = new Set(results.edgeIds);
  const stack = [...results.nodeIds];

  while (stack.length) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    (reverse.get(current) ?? []).forEach(({ source, edgeId }) => {
      if (!nodeIds.has(source)) {
        nodeIds.add(source);
        stack.push(source);
      }
      edgeIds.add(edgeId);
    });
  }

  return {
    nodeIds: Array.from(nodeIds),
    edgeIds: Array.from(edgeIds),
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
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const mergeBounds = (
  current:
    | { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number }
    | null,
  next:
    | { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number }
    | null
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
  nodes: PositionedNode[],
  labels: string[],
  labelOffset: number,
  layout: GraphConfig['layout'],
  layoutDirection: GraphConfig['layoutDirection']
) => {
  if (!nodes.length || !labels.length) {
    return null;
  }

  const columns = new Map<number, PositionedNode[]>();
  nodes.forEach((node) => {
    const column = columns.get(node.position.x) ?? [];
    column.push(node);
    columns.set(node.position.x, column);
  });

  const xs = Array.from(columns.keys()).sort((a, b) => a - b);
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

const getFitViewportForStory = (
  graph: NxGraphInput,
  config: GraphConfig,
  labels: string[],
  width: number,
  height: number,
  minZoom: number,
  maxZoom: number
): GraphViewport => {
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
    const nodeWidth = node.size?.width ?? 180;
    const nodeHeight = node.size?.height ?? 72;

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
    return INITIAL_VIEWPORT;
  }

  const paddedBounds = {
    minX: contentBounds.minX,
    minY: contentBounds.minY,
    maxX: contentBounds.maxX,
    maxY: contentBounds.maxY,
    width: contentBounds.width,
    height: contentBounds.height,
  };

  const availableWidth = Math.max(width - FIT_PADDING.left - FIT_PADDING.right, 1);
  const availableHeight = Math.max(height - FIT_PADDING.top - FIT_PADDING.bottom, 1);
  const zoom = Math.min(
    maxZoom,
    Math.max(minZoom, Math.min(availableWidth / paddedBounds.width, availableHeight / paddedBounds.height))
  );

  return {
    x:
      FIT_PADDING.left +
      (availableWidth - paddedBounds.width * zoom) / 2 -
      paddedBounds.minX * zoom,
    y:
      FIT_PADDING.top +
      (availableHeight - paddedBounds.height * zoom) / 2 -
      paddedBounds.minY * zoom,
    zoom,
  };
};

const getStageViewsForStory = (graph: NxGraphInput, config: GraphConfig, labels: string[]): StageView[] => {
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

  const columns = new Map<number, PositionedNode[]>();
  positionedNodes.forEach((node) => {
    const key = Math.round(node.position.x);
    const column = columns.get(key) ?? [];
    column.push(node);
    columns.set(key, column);
  });

  return Array.from(columns.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([_, columnNodes], index) => {
      const minX = Math.min(...columnNodes.map((node) => node.position.x));
      const minY = Math.min(...columnNodes.map((node) => node.position.y));
      const maxX = Math.max(...columnNodes.map((node) => node.position.x + (node.size?.width ?? 280)));
      const maxY = Math.max(...columnNodes.map((node) => node.position.y + (node.size?.height ?? 112)));

      return {
        index,
        label: labels[index] ?? `STAGE ${index + 1}`,
        bounds: {
          minX,
          minY: minY - (config.labelOffset ?? 40) - LABEL_PILL_HEIGHT + 6,
          maxX,
          maxY,
          width: maxX - minX,
          height: maxY - (minY - (config.labelOffset ?? 40) - LABEL_PILL_HEIGHT + 6),
        },
      };
    });
};

const getStageViewportForStory = (
  bounds: StageView['bounds'],
  width: number,
  height: number,
  verticalPosition: VerticalStagePosition = 'top'
): StageViewportResult => {
  const targetWidth = Math.max(bounds.width + NAVIGATION_STAGE_PADDING_X * 2, NAVIGATION_STAGE_MIN_WIDTH);
  const targetHeight = Math.max(bounds.height + NAVIGATION_STAGE_PADDING_Y * 2, NAVIGATION_STAGE_MIN_HEIGHT);
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
};

export const BracketPlayground = ({ graph }: BracketPlaygroundProps) => {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isStageNavigationMode, setIsStageNavigationMode] = useState(false);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
  const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS_SIZE);
  const [viewport, setViewport] = useState<GraphViewport>(INITIAL_VIEWPORT);
  const [selection, setSelection] = useState<GraphSelection>(EMPTY_SELECTION);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GraphSearchResults>(EMPTY_SELECTION);
  const [hoverState, setHoverState] = useState<HoverState>(null);
  const [layout, setLayout] = useState<GraphConfig['layout']>(LayoutType.Tree);
  const [layoutDirection, setLayoutDirection] = useState<GraphConfig['layoutDirection']>(
    LayoutDirection.LTR
  );
  const [routingStyle, setRoutingStyle] = useState<GraphConfig['routingStyle']>('orthogonal');
  const [nodeSizing, setNodeSizing] = useState<GraphConfig['nodeSizing']>('fixed');
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>('multiple');
  const [renderMode, setRenderMode] = useState<SquashNodeRenderMode>('export');
  const [highlightMode, setHighlightMode] = useState<HighlightMode>('ancestry');
  const [showViewportControls, setShowViewportControls] = useState(true);
  const [curveEdges, setCurveEdges] = useState(true);
  const [hideUnmatchedSearch, setHideUnmatchedSearch] = useState(false);
  const [marqueeSelectionEnabled, setMarqueeSelectionEnabled] = useState(true);
  const [hoverHighlight, setHoverHighlight] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Double-click a match to collapse or expand its subtree.');
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [verticalStagePosition, setVerticalStagePosition] = useState<VerticalStagePosition>('top');
  const [canPagePlayersVertically, setCanPagePlayersVertically] = useState(false);
  const previousViewportRef = useRef<GraphViewport | null>(null);

  const enrichedGraph = useMemo(() => injectTournamentPathKeys(graph), [graph]);
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

  const vertexComponent = useMemo<VertexComponent>(
    () =>
      (props: VertexComponentProps) =>
        React.createElement(SquashNode as React.ComponentType<any>, {
          ...props,
          renderMode,
        }),
    [renderMode]
  );

  const config = useMemo<GraphConfig>(() => {
    const dark = isDarkMode;
    return {
      layout,
      layoutDirection,
      width: canvasSize.width,
      height: canvasSize.height,
      padding: 24,
      defaultEdgeType: EdgeType.Undirected,
      curveEdges,
      curveStrength: 0.2,
      forceRightToLeft: true,
      hoverHighlight,
      hoverEdgeColor: dark ? '#5d6470' : '#d9d6cf',
      hoverNodeInColor: dark ? '#9ab08d' : '#7c9070',
      hoverNodeOutColor: dark ? '#9ab08d' : '#7c9070',
      hoverNodeBothColor: dark ? '#9ab08d' : '#7c9070',
      theme: dark ? DARK_THEME : LIGHT_THEME,
      labelOffset: 40,
      labels,
      routingStyle,
      edgeSeparation: 20,
      selfLoopRadius: 34,
      nodeSizing,
      fixedNodeSize: { width: 280, height: 112 },
      edgeLabelColor: dark ? '#e2e8f0' : '#334155',
      labelPillBackground: 'transparent',
      labelPillBorderColor: 'transparent',
      labelPillTextColor: dark ? '#d8d2c7' : '#444b55',
    };
  }, [canvasSize.height, canvasSize.width, curveEdges, hoverHighlight, isDarkMode, labels, layout, layoutDirection, nodeSizing, routingStyle]);

  const stageViews = useMemo(() => getStageViewsForStory(enrichedGraph, config, labels), [config, enrichedGraph, labels]);

  const handleViewportChange = useCallback((nextViewport: GraphViewport) => {
    setViewport((current) => (areViewportsEqual(current, nextViewport) ? current : nextViewport));
  }, []);

  const handleSearchResultsChange = useCallback((nextResults: GraphSearchResults) => {
    setSearchResults((current) =>
      areSearchResultsEqual(current, nextResults) ? current : nextResults
    );
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

      const nextStageViewport = getStageViewportForStory(
        stage.bounds,
        Math.max(1, element.clientWidth),
        Math.max(1, element.clientHeight),
        verticalStagePosition
      );

      setCanPagePlayersVertically(nextStageViewport.canPageVertically);
      graphRef.current?.setViewport?.(nextStageViewport.viewport);
      setViewport(nextStageViewport.viewport);
    },
    [stageViews, verticalStagePosition]
  );

  const handleToggleStageNavigationMode = useCallback(() => {
    if (isStageNavigationMode) {
      const previousViewport = previousViewportRef.current;
      if (previousViewport) {
        graphRef.current?.setViewport?.(previousViewport);
        setViewport(previousViewport);
      } else {
        handleStoryFit();
      }
      setIsStageNavigationMode(false);
      setStatusMessage('Exited stage navigation mode.');
      return;
    }

    previousViewportRef.current = viewport;
    setVerticalStagePosition('top');
    setIsStageNavigationMode(true);
    setStatusMessage('Stage navigation mode active. Use the arrows or stage chips to move between rounds.');
  }, [handleStoryFit, isStageNavigationMode, viewport]);

  useEffect(() => {
    setActiveStageIndex((current) => Math.min(current, Math.max(stageViews.length - 1, 0)));
  }, [stageViews.length]);

  useEffect(() => {
    if (!isStageNavigationMode || !stageViews.length) {
      return;
    }

    focusStage(activeStageIndex);
  }, [activeStageIndex, focusStage, isStageNavigationMode, stageViews.length]);

  const handleSelectStage = useCallback((stageIndex: number) => {
    setVerticalStagePosition('top');
    setActiveStageIndex(stageIndex);
  }, []);

  const handlePreviousStage = useCallback(() => {
    setVerticalStagePosition('top');
    setActiveStageIndex((current) => Math.max(current - 1, 0));
  }, []);

  const handleNextStage = useCallback(() => {
    setVerticalStagePosition('top');
    setActiveStageIndex((current) => Math.min(current + 1, stageViews.length - 1));
  }, [stageViews.length]);

  const handlePagePlayersUp = useCallback(() => {
    setVerticalStagePosition('top');
  }, []);

  const handlePagePlayersDown = useCallback(() => {
    setVerticalStagePosition('bottom');
  }, []);

  return (
    <BracketThemeProvider mode={isDarkMode ? 'dark' : 'light'}>
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: isDarkMode ? '#020617' : '#f8fafc',
          color: isDarkMode ? '#e2e8f0' : '#0f172a',
        }}
      >
        <aside
          style={{
            width: PANEL_WIDTH,
            padding: 18,
            boxSizing: 'border-box',
            borderRight: `1px solid ${isDarkMode ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.08)'}`,
            background: isDarkMode ? '#0f172a' : '#ffffff',
            display: 'grid',
            gap: 16,
            alignContent: 'start',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <div style={{ display: 'grid', gap: 4 }}>
            <strong style={{ fontSize: 18 }}>Bracket playground</strong>
            <span style={{ fontSize: 13, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              Story UI for viewport, layout, routing, selection, collapse, search, and render modes.
            </span>
          </div>

          <section style={controlSectionStyle}>
            <span style={labelStyle}>Viewport</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <button
                style={buttonStyle}
                onClick={() => graphRef.current?.zoomOut?.()}
              >
                −
              </button>
              <button
                style={buttonStyle}
                onClick={() => graphRef.current?.zoomIn?.()}
              >
                +
              </button>
              <button
                style={buttonStyle}
                onClick={handleStoryFit}
              >
                Fit
              </button>
              <button
                style={buttonStyle}
                onClick={() => graphRef.current?.resetViewport?.()}
              >
                1:1
              </button>
            </div>
            <div style={{ fontSize: 13, color: isDarkMode ? '#cbd5e1' : '#334155' }}>
              Zoom {viewport.zoom.toFixed(2)} · x {Math.round(viewport.x)} · y {Math.round(viewport.y)}
            </div>
            <label style={toggleRowStyle}>
              <span>Built-in graph controls</span>
              <input
                type="checkbox"
                checked={showViewportControls}
                onChange={(event) => setShowViewportControls(event.target.checked)}
              />
            </label>
          </section>

          <section style={controlSectionStyle}>
            <span style={labelStyle}>Layout and routing</span>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Layout</span>
              <select
                style={selectStyle}
                value={layout}
                onChange={(event) => setLayout(event.target.value as GraphConfig['layout'])}
              >
                <option value={LayoutType.Tree}>Tree</option>
                <option value={LayoutType.Radial}>Radial tree</option>
                <option value={LayoutType.Dag}>DAG / layered</option>
                <option value={LayoutType.CompactBracket}>Compact bracket</option>
                <option value={LayoutType.OrthogonalFlow}>Orthogonal flow</option>
                <option value={LayoutType.ForceDirected}>Force-directed</option>
                <option value={LayoutType.Centered}>Centered</option>
                <option value={LayoutType.Grid}>Grid</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Direction</span>
              <select
                style={selectStyle}
                value={layoutDirection}
                onChange={(event) =>
                  setLayoutDirection(event.target.value as GraphConfig['layoutDirection'])
                }
              >
                <option value={LayoutDirection.LTR}>Left to right</option>
                <option value={LayoutDirection.RTL}>Right to left</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Routing</span>
              <select
                style={selectStyle}
                value={routingStyle}
                onChange={(event) =>
                  setRoutingStyle(event.target.value as GraphConfig['routingStyle'])
                }
              >
                <option value="smart">Smart</option>
                <option value="orthogonal">Orthogonal</option>
                <option value="bundled">Bundled</option>
              </select>
            </label>
            <label style={toggleRowStyle}>
              <span>Curved edges</span>
              <input
                type="checkbox"
                checked={curveEdges}
                onChange={(event) => setCurveEdges(event.target.checked)}
              />
            </label>
          </section>

          <section style={controlSectionStyle}>
            <span style={labelStyle}>Node rendering</span>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Render mode</span>
              <select
                style={selectStyle}
                value={renderMode}
                onChange={(event) => setRenderMode(event.target.value as SquashNodeRenderMode)}
              >
                <option value="export">Export-safe SVG</option>
                <option value="server">Server SVG</option>
                <option value="svg">Client SVG</option>
                <option value="html">foreignObject</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Node sizing</span>
              <select
                style={selectStyle}
                value={nodeSizing}
                onChange={(event) => setNodeSizing(event.target.value as GraphConfig['nodeSizing'])}
              >
                <option value="fixed">Fixed</option>
                <option value="label">Label-estimated</option>
                <option value="measured">Measured</option>
              </select>
            </label>
            <label style={toggleRowStyle}>
              <span>Dark mode</span>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={(event) => setIsDarkMode(event.target.checked)}
              />
            </label>
            <button style={buttonStyle} onClick={() => serializeSvg(containerRef.current)}>
              Export SVG
            </button>
          </section>

          <section style={controlSectionStyle}>
            <span style={labelStyle}>Selection and collapse</span>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Selection mode</span>
              <select
                style={selectStyle}
                value={selectionMode}
                onChange={(event) => setSelectionMode(event.target.value as 'single' | 'multiple')}
              >
                <option value="single">Single</option>
                <option value="multiple">Multiple</option>
              </select>
            </label>
            <label style={toggleRowStyle}>
              <span>Marquee selection</span>
              <input
                type="checkbox"
                checked={marqueeSelectionEnabled}
                onChange={(event) => setMarqueeSelectionEnabled(event.target.checked)}
              />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                style={buttonStyle}
                onClick={() => {
                  setSelection(EMPTY_SELECTION);
                  setFocusedNodeId(null);
                }}
              >
                Clear selection
              </button>
              <button
                style={buttonStyle}
                onClick={() => {
                  const nextFocusedNodeId = selection.nodeIds[0] ?? null;
                  if (nextFocusedNodeId) {
                    setFocusedNodeId(nextFocusedNodeId);
                    graphRef.current?.centerOnNode?.(nextFocusedNodeId);
                    setStatusMessage(`Focused ${nextFocusedNodeId}. Use keyboard navigation to inspect neighbours.`);
                  }
                }}
              >
                Focus selected
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                style={buttonStyle}
                onClick={() => {
                  if (!focusedNodeId || collapsedNodeIds.includes(focusedNodeId)) {
                    return;
                  }
                  setCollapsedNodeIds((current) => [...current, focusedNodeId]);
                  setStatusMessage(`Collapsed subtree for ${focusedNodeId}.`);
                }}
              >
                Collapse focused
              </button>
              <button
                style={buttonStyle}
                onClick={() => {
                  setCollapsedNodeIds([]);
                  setStatusMessage('Expanded all subtrees.');
                }}
              >
                Expand all
              </button>
            </div>
            <div style={{ fontSize: 13, color: isDarkMode ? '#cbd5e1' : '#334155' }}>
              Focused: {focusedNodeId ?? 'none'}
            </div>
            <div style={{ fontSize: 13, color: isDarkMode ? '#cbd5e1' : '#334155' }}>
              Selected nodes: {selection.nodeIds.length} · Selected edges: {selection.edgeIds.length}
            </div>
          </section>

          <section style={controlSectionStyle}>
            <span style={labelStyle}>Search and highlight</span>
            <input
              style={inputStyle}
              placeholder="Search player, stage, or node id"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Highlight mode</span>
              <select
                style={selectStyle}
                value={highlightMode}
                onChange={(event) => setHighlightMode(event.target.value as HighlightMode)}
              >
                <option value="match">Direct matches only</option>
                <option value="ancestry">Highlight path to root</option>
              </select>
            </label>
            <label style={toggleRowStyle}>
              <span>Hide unmatched nodes</span>
              <input
                type="checkbox"
                checked={hideUnmatchedSearch}
                onChange={(event) => setHideUnmatchedSearch(event.target.checked)}
              />
            </label>
            <label style={toggleRowStyle}>
              <span>Hover highlight</span>
              <input
                type="checkbox"
                checked={hoverHighlight}
                onChange={(event) => setHoverHighlight(event.target.checked)}
              />
            </label>
            <div style={{ fontSize: 13, color: isDarkMode ? '#cbd5e1' : '#334155' }}>
              Matches: {searchResults.nodeIds.length} nodes · {searchResults.edgeIds.length} edges
            </div>
            <div style={{ fontSize: 13, color: isDarkMode ? '#cbd5e1' : '#334155' }}>
              Hover: {hoverState ? `${hoverState.kind} ${hoverState.id}` : 'none'}
            </div>
          </section>

          <section style={{ display: 'grid', gap: 6 }}>
            <span style={labelStyle}>Hints</span>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: isDarkMode ? '#cbd5e1' : '#334155' }}>
              {statusMessage}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.5, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              Shift + drag for marquee selection. Arrow keys pan or move focus. Enter toggles the focused node selection.
            </div>
          </section>
        </aside>

        <main
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            padding: 24,
            boxSizing: 'border-box',
          }}
        >
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: '100%',
              height: 'calc(100vh - 48px)',
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
            <StoryGraph
              ref={graphRef}
              graph={enrichedGraph}
              vertexComponent={vertexComponent}
              config={config}
              defaultViewport={INITIAL_VIEWPORT}
              onViewportChange={handleViewportChange}
              fitViewOnMount
              fitViewPadding={12}
              minZoom={0.05}
              maxZoom={3}
              zoomStep={0.12}
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
              onNodeCollapse={(nodeId: string) => setStatusMessage(`Collapsed subtree for ${nodeId}.`)}
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
                    background: isDarkMode
                      ? 'rgba(30, 41, 59, 0.96)'
                      : 'rgba(255, 255, 255, 0.96)',
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
                  aria-label={isStageNavigationMode ? 'Exit stage navigation mode' : 'Enter stage navigation mode'}
                  title={isStageNavigationMode ? 'Exit stage navigation mode' : 'Enter stage navigation mode'}
                  onClick={handleToggleStageNavigationMode}
                  style={{
                    ...iconButtonBaseStyle,
                    background: isDarkMode
                      ? 'rgba(30, 41, 59, 0.96)'
                      : 'rgba(255, 255, 255, 0.96)',
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
                  {
                    key: 'toggle-dark-mode',
                    title: isDarkMode ? 'Switch to light mode' : 'Switch to dark mode',
                    icon: <DarkModeIcon active={isDarkMode} />,
                    onClick: () => setIsDarkMode((current) => !current),
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

            {isStageNavigationMode && stageViews.length > 1 ? (
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
                    background: isDarkMode ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.96)',
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
                    background: isDarkMode ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                    color: isDarkMode ? '#e2e8f0' : '#0f172a',
                    opacity: activeStageIndex >= stageViews.length - 1 ? 0.45 : 1,
                    cursor: activeStageIndex >= stageViews.length - 1 ? 'default' : 'pointer',
                    zIndex: 2,
                  }}
                >
                  →
                </button>
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
                      disabled={verticalStagePosition === 'top'}
                      style={{
                        ...iconButtonBaseStyle,
                        background: isDarkMode ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                        color: isDarkMode ? '#e2e8f0' : '#0f172a',
                        opacity: verticalStagePosition === 'top' ? 0.45 : 1,
                        cursor: verticalStagePosition === 'top' ? 'default' : 'pointer',
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Show lower players"
                      onClick={handlePagePlayersDown}
                      disabled={verticalStagePosition === 'bottom'}
                      style={{
                        ...iconButtonBaseStyle,
                        background: isDarkMode ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                        color: isDarkMode ? '#e2e8f0' : '#0f172a',
                        opacity: verticalStagePosition === 'bottom' ? 0.45 : 1,
                        cursor: verticalStagePosition === 'bottom' ? 'default' : 'pointer',
                      }}
                    >
                      ↓
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
                    border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.22)'}`,
                    background: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: isDarkMode ? '0 16px 40px rgba(2, 6, 23, 0.45)' : '0 16px 40px rgba(15, 23, 42, 0.14)',
                    overflowX: 'auto',
                    zIndex: 2,
                  }}
                >
                  {stageViews.map((stage, index) => {
                    const isActive = index === activeStageIndex;
                    return (
                      <button
                        key={stage.label}
                        type="button"
                        onClick={() => handleSelectStage(index)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 999,
                          border: `1px solid ${isActive ? '#7c9070' : 'transparent'}`,
                          background: isActive ? '#7c9070' : 'transparent',
                          color: isActive ? '#ffffff' : isDarkMode ? '#cbd5e1' : '#334155',
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
        </main>
      </div>
    </BracketThemeProvider>
  );
};

export default BracketPlayground;
