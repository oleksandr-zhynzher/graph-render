import type { GraphConfig } from '@graph-render/types';
import { LayoutType, LayoutDirection, EdgeType } from '@graph-render/types';
import { NODE_DIMENSIONS } from './node';

export const DEFAULT_TOURNAMENT_CONFIG: Readonly<GraphConfig> = {
  layout: LayoutType.Tree,
  layoutDirection: LayoutDirection.LTR,
  width: 1600,
  height: 1200,
  padding: 40,
  defaultEdgeType: EdgeType.Undirected,
  routingStyle: 'orthogonal',
  curveEdges: false,
  curveStrength: 0,
  forceRightToLeft: true,
  hoverHighlight: false,
  hoverEdgeColor: '#7c9070',
  hoverNodeInColor: '#7c9070',
  hoverNodeOutColor: '#7c9070',
  hoverNodeBothColor: '#7c9070',
  theme: {
    background: '#f7f6f3',
    edgeColor: '#d9d6cf',
    edgeWidth: 2,
    nodeGap: 72,
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
  },
  fixedNodeSize: {
    width: NODE_DIMENSIONS.WIDTH,
    height: NODE_DIMENSIONS.HEIGHT,
  },
  labelOffset: 46,
  labelPillBackground: '#00000000',
  labelPillBorderColor: '#00000000',
  labelPillTextColor: '#8e8e93',
} as const;

export const DARK_TOURNAMENT_CONFIG: Readonly<GraphConfig> = {
  ...DEFAULT_TOURNAMENT_CONFIG,
  hoverEdgeColor: '#9ab08d',
  hoverNodeInColor: '#9ab08d',
  hoverNodeOutColor: '#9ab08d',
  hoverNodeBothColor: '#9ab08d',
  labelPillBackground: '#f3f1ea',
  labelPillBorderColor: '#d7d2c8',
  labelPillTextColor: '#4e5560',
  theme: {
    background: '#191e24',
    edgeColor: '#5d6470',
    edgeWidth: 2,
    nodeGap: 72,
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
  },
} as const;
