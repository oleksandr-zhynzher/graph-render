import { EdgeType, GraphConfig, LayoutDirection, LayoutType } from '@graph-render/types';

// These three fields are intentionally absent from the default object
// (their undefined values let consumers override them selectively).
// Using Partial<Pick<...>> makes that intent explicit: the type says
// "these may or may not be set" so TypeScript won't complain about them
// being missing from the object literal below.
export const DEFAULT_CONFIG: Required<
  Pick<
    GraphConfig,
    | 'width'
    | 'height'
    | 'defaultEdgeType'
    | 'curveEdges'
    | 'curveStrength'
    | 'arrowPadding'
    | 'routingStyle'
    | 'edgeSeparation'
    | 'selfLoopRadius'
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
    | 'edgeLabelColor'
  >
> &
  Partial<Pick<GraphConfig, 'hoverNodeBorderColor' | 'hoverNodeBothColor' | 'forceRightToLeft'>> = {
  width: 960,
  height: 720,
  defaultEdgeType: EdgeType.Directed,
  curveEdges: true,
  curveStrength: 0.3,
  arrowPadding: 6,
  routingStyle: 'smart',
  edgeSeparation: 18,
  selfLoopRadius: 32,
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
  edgeLabelColor: '#334155',
  hoverNodeInColor: '#2ecc71',
  hoverNodeOutColor: '#ff5b5b',
  hoverNodeHighlight: true,
};
