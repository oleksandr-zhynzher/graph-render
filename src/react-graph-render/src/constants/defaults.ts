import { EdgeType, GraphConfig, LayoutDirection, LayoutType } from '@graph-render/types';

export const DEFAULT_CONFIG: Required<
  Pick<
    GraphConfig,
    | 'width'
    | 'height'
    | 'defaultEdgeType'
    | 'curveEdges'
    | 'curveStrength'
    | 'arrowPadding'
    | 'layout'
    | 'layoutDirection'
    | 'autoLabels'
    | 'labelOffset'
    | 'nodeSizing'
    | 'labelMeasurementPaddingX'
    | 'labelMeasurementPaddingY'
    | 'labelMeasurementCharWidth'
    | 'labelMeasurementLineHeight'
    | 'hoverHighlight'
    | 'hoverEdgeColor'
    | 'hoverNodeInColor'
    | 'hoverNodeOutColor'
    | 'hoverNodeHighlight'
  >
> &
  Pick<GraphConfig, 'hoverNodeBorderColor' | 'hoverNodeBothColor' | 'forceRightToLeft'> = {
  width: 960,
  height: 720,
  defaultEdgeType: EdgeType.Directed,
  curveEdges: true,
  curveStrength: 0.3,
  arrowPadding: 6,
  layout: LayoutType.Centered,
  layoutDirection: LayoutDirection.LTR,
  autoLabels: false,
  labelOffset: 32,
  nodeSizing: 'fixed',
  labelMeasurementPaddingX: 18,
  labelMeasurementPaddingY: 12,
  labelMeasurementCharWidth: 8,
  labelMeasurementLineHeight: 18,
  hoverHighlight: true,
  hoverEdgeColor: '#4da3ff',
  hoverNodeInColor: '#2ecc71',
  hoverNodeOutColor: '#ff5b5b',
  hoverNodeHighlight: true,
};
