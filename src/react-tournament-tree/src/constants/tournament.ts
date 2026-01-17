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
  hoverEdgeColor: '#3f434b',
  hoverNodeInColor: '#3f434b',
  hoverNodeOutColor: '#3f434b',
  hoverNodeBothColor: '#3f434b',
  theme: {
    background: '#ffffff',
    edgeColor: '#3f434b',
    edgeWidth: 2,
    nodeGap: 48,
    fontFamily: '"Space Grotesk", "Segoe UI", system-ui, sans-serif',
  },
  labelOffset: 40,
} as const;

export const DARK_TOURNAMENT_CONFIG: Readonly<GraphConfig> = {
  ...DEFAULT_TOURNAMENT_CONFIG,
  hoverEdgeColor: '#94a3b8',
  hoverNodeInColor: '#94a3b8',
  hoverNodeOutColor: '#94a3b8',
  hoverNodeBothColor: '#94a3b8',
  theme: {
    background: '#000000',
    edgeColor: '#64748b',
    edgeWidth: 2,
    nodeGap: 48,
    fontFamily: '"Space Grotesk", "Segoe UI", system-ui, sans-serif',
  },
} as const;
