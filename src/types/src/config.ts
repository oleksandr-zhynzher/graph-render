import type { GraphInputValidationMode } from './graph';
import type { NodeSizingMode, Size } from './node';

export enum GraphFailureBehavior {
  Throw = 'throw',
  Degrade = 'degrade',
}

export enum RoutingStyle {
  Smart = 'smart',
  Orthogonal = 'orthogonal',
  Bundled = 'bundled',
}

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
  readonly background?: string | undefined;
  readonly edgeColor?: string | undefined;
  readonly edgeWidth?: number | undefined;
  readonly nodeGap?: number | undefined;
  readonly fontFamily?: string | undefined;
  readonly nodeBorderColor?: string | undefined;
  readonly nodeBorderWidth?: number | undefined;
}

export interface GraphConfig {
  readonly defaultEdgeType?: EdgeType | undefined;
  readonly failureBehavior?: GraphFailureBehavior | undefined;
  readonly inputValidationMode?: GraphInputValidationMode | undefined;
  readonly showArrows?: boolean | undefined;
  readonly width?: number | undefined;
  readonly height?: number | undefined;
  readonly padding?: number | undefined;
  readonly nodeSizing?: NodeSizingMode | undefined;
  readonly fixedNodeSize?: Size | undefined;
  readonly labelMeasurementPaddingX?: number | undefined;
  readonly labelMeasurementPaddingY?: number | undefined;
  readonly labelMeasurementCharWidth?: number | undefined;
  readonly labelMeasurementLineHeight?: number | undefined;
  readonly theme?: GraphTheme | undefined;
  readonly curveEdges?: boolean | undefined;
  readonly curveStrength?: number | undefined;
  readonly arrowPadding?: number | undefined;
  readonly routingStyle?: RoutingStyle | undefined;
  readonly edgeSeparation?: number | undefined;
  readonly selfLoopRadius?: number | undefined;
  readonly edgeLabelColor?: string | undefined;
  readonly layout?: LayoutType | undefined;
  readonly layoutDirection?: LayoutDirection | undefined;
  readonly hoverHighlight?: boolean | undefined;
  readonly hoverEdgeColor?: string | undefined;
  readonly hoverNodeBorderColor?: string | undefined;
  readonly hoverNodeInColor?: string | undefined;
  readonly hoverNodeOutColor?: string | undefined;
  readonly hoverNodeBothColor?: string | undefined;
  readonly hoverNodeHighlight?: boolean | undefined;
  readonly labels?: readonly string[] | undefined;
  readonly autoLabels?: boolean | undefined;
  readonly labelOffset?: number | undefined;
  readonly forceRightToLeft?: boolean | undefined;
  /** Background color for the column-label pills. Defaults to `#eef1f6`. */
  readonly labelPillBackground?: string | undefined;
  /** Border color for the column-label pills. Defaults to `#d7dbe3`. */
  readonly labelPillBorderColor?: string | undefined;
  /** Text color for the column-label pills. Defaults to `#3f434b`. */
  readonly labelPillTextColor?: string | undefined;
}

export interface NormalizedGraphConfig extends Omit<GraphConfig, 'theme' | 'fixedNodeSize'> {
  readonly width: number;
  readonly height: number;
  readonly padding: number;
  readonly defaultEdgeType: EdgeType;
  readonly failureBehavior: GraphFailureBehavior;
  readonly inputValidationMode: GraphInputValidationMode;
  readonly showArrows: boolean;
  readonly nodeSizing: NonNullable<GraphConfig['nodeSizing']>;
  readonly fixedNodeSize: NonNullable<GraphConfig['fixedNodeSize']>;
  readonly theme: GraphTheme;
  readonly curveEdges: boolean;
  readonly curveStrength: number;
  readonly arrowPadding: number;
  readonly routingStyle: NonNullable<GraphConfig['routingStyle']>;
  readonly edgeSeparation: number;
  readonly selfLoopRadius: number;
  readonly edgeLabelColor: string;
  readonly layout: LayoutType;
  readonly layoutDirection: LayoutDirection;
  readonly hoverHighlight: boolean;
  readonly hoverEdgeColor: string;
  readonly hoverNodeInColor: string;
  readonly hoverNodeOutColor: string;
  readonly hoverNodeHighlight: boolean;
  readonly autoLabels: boolean;
  readonly labelOffset: number;
  readonly labelPillBackground: string;
  readonly labelPillBorderColor: string;
  readonly labelPillTextColor: string;
  readonly labelMeasurementPaddingX: number;
  readonly labelMeasurementPaddingY: number;
  readonly labelMeasurementCharWidth: number;
  readonly labelMeasurementLineHeight: number;
}
