import { NodeSizingMode, Size } from './node';
import { GraphInputValidationMode } from './graph';

export type GraphFailureBehavior = 'throw' | 'degrade';

export enum EdgeType {
  Directed = 'directed',
  Undirected = 'undirected',
}

export enum LayoutType {
  Grid = 'grid',
  Tree = 'tree',
  Centered = 'centered',
  Radial = 'radial',
  Dag = 'dag',
  ForceDirected = 'force-directed',
  CompactBracket = 'compact-bracket',
  OrthogonalFlow = 'orthogonal-flow',
}

export enum LayoutDirection {
  LTR = 'ltr',
  RTL = 'rtl',
}

export interface GraphTheme {
  background?: string;
  edgeColor?: string;
  edgeWidth?: number;
  nodeGap?: number;
  fontFamily?: string;
  nodeBorderColor?: string;
  nodeBorderWidth?: number;
}

export interface GraphConfig {
  defaultEdgeType?: EdgeType;
  failureBehavior?: GraphFailureBehavior;
  inputValidationMode?: GraphInputValidationMode;
  showArrows?: boolean;
  width?: number;
  height?: number;
  padding?: number;
  nodeSizing?: NodeSizingMode;
  fixedNodeSize?: Size;
  labelMeasurementPaddingX?: number;
  labelMeasurementPaddingY?: number;
  labelMeasurementCharWidth?: number;
  labelMeasurementLineHeight?: number;
  theme?: GraphTheme;
  curveEdges?: boolean;
  curveStrength?: number;
  arrowPadding?: number;
  routingStyle?: 'smart' | 'orthogonal' | 'bundled';
  edgeSeparation?: number;
  selfLoopRadius?: number;
  edgeLabelColor?: string;
  layout?: LayoutType;
  layoutDirection?: LayoutDirection;
  hoverHighlight?: boolean;
  hoverEdgeColor?: string;
  hoverNodeBorderColor?: string;
  hoverNodeInColor?: string;
  hoverNodeOutColor?: string;
  hoverNodeBothColor?: string;
  hoverNodeHighlight?: boolean;
  labels?: string[];
  autoLabels?: boolean;
  labelOffset?: number;
  forceRightToLeft?: boolean;
  /** Background color for the column-label pills. Defaults to `#eef1f6`. */
  labelPillBackground?: string;
  /** Border color for the column-label pills. Defaults to `#d7dbe3`. */
  labelPillBorderColor?: string;
  /** Text color for the column-label pills. Defaults to `#3f434b`. */
  labelPillTextColor?: string;
}
