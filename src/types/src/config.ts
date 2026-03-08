export enum EdgeType {
  Directed = 'directed',
  Undirected = 'undirected',
}

export enum LayoutType {
  Grid = 'grid',
  Tree = 'tree',
  Centered = 'centered',
  Radial = 'radial',
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
  showArrows?: boolean;
  width?: number;
  height?: number;
  padding?: number;
  theme?: GraphTheme;
  curveEdges?: boolean;
  curveStrength?: number;
  arrowPadding?: number;
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
}
