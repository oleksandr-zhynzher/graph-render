import { EdgeType } from '@graph-render/types';

export const DEFAULT_CONFIG = {
  width: 960,
  height: 720,
  defaultEdgeType: 'directed' as EdgeType,
  curveEdges: true,
  curveStrength: 0.3,
  arrowPadding: 6,
  layout: 'centered' as const,
  layoutDirection: 'ltr' as const,
  autoLabels: false,
  labelOffset: 32,
  hoverHighlight: true,
  hoverEdgeColor: '#4da3ff',
  hoverNodeInColor: '#2ecc71',
  hoverNodeOutColor: '#ff5b5b',
  hoverNodeHighlight: true,
};
