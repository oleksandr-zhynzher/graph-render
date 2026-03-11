import type { GraphConfig } from '@graph-render/types';
import { LayoutType, LayoutDirection, EdgeType } from '@graph-render/types';

export const DEFAULT_TOURNAMENT_CONFIG: Readonly<GraphConfig> = {
  layout: LayoutType.Tree,
  layoutDirection: LayoutDirection.LTR,
  width: 2000,
  height: 2000,
  padding: 4,
  defaultEdgeType: EdgeType.Undirected,
  curveEdges: true,
  curveStrength: 0.2,
  forceRightToLeft: true,
  hoverHighlight: false,
  hoverEdgeColor: '#64748b',
  hoverNodeInColor: '#64748b',
  hoverNodeOutColor: '#64748b',
  hoverNodeBothColor: '#64748b',
  theme: {
    background: '#f1f5f9',
    edgeColor: '#b8c4d4',
    edgeWidth: 1.5,
    nodeGap: 56,
    fontFamily: '"Space Grotesk", "Segoe UI", system-ui, sans-serif',
  },
  labelOffset: 44,
  labelPillBackground: '#e2e8f0',
  labelPillBorderColor: '#cbd5e1',
  labelPillTextColor: '#475569',
} as const;

export const DARK_TOURNAMENT_CONFIG: Readonly<GraphConfig> = {
  ...DEFAULT_TOURNAMENT_CONFIG,
  hoverEdgeColor: '#94a3b8',
  hoverNodeInColor: '#94a3b8',
  hoverNodeOutColor: '#94a3b8',
  hoverNodeBothColor: '#94a3b8',
  labelPillBackground: '#1e2a3a',
  labelPillBorderColor: '#2d3d52',
  labelPillTextColor: '#94a3b8',
  theme: {
    background: '#0c1524',
    edgeColor: '#2d3f52',
    edgeWidth: 1.5,
    nodeGap: 56,
    fontFamily: '"Space Grotesk", "Segoe UI", system-ui, sans-serif',
  },
} as const;
