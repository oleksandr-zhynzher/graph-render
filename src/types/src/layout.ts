import { NodeData } from './node';
import { EdgeData } from './edge';
import { GraphTheme, GraphConfig } from './config';

export interface LayoutOptions {
  nodes: NodeData[];
  edges: EdgeData[];
  padding?: number;
  theme?: GraphTheme;
  layout?: GraphConfig['layout'];
  width?: number;
  height?: number;
  layoutDirection?: GraphConfig['layoutDirection'];
  nodeSizing?: GraphConfig['nodeSizing'];
  fixedNodeSize?: GraphConfig['fixedNodeSize'];
  labelMeasurementPaddingX?: GraphConfig['labelMeasurementPaddingX'];
  labelMeasurementPaddingY?: GraphConfig['labelMeasurementPaddingY'];
  labelMeasurementCharWidth?: GraphConfig['labelMeasurementCharWidth'];
  labelMeasurementLineHeight?: GraphConfig['labelMeasurementLineHeight'];
}

export interface GraphTopology {
  incoming: Map<string, number>;
  outgoing: Map<string, string[]>;
}

export interface TreeMetrics {
  maxLevel: number;
  maxNodeHeight: number;
  maxLevelCount: number;
  totalHeight: number;
  baseY: number;
}
