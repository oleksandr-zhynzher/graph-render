import type { GraphConfig, GraphTheme } from './config';
import type { EdgeData } from './edge';
import type { NodeData } from './node';

export interface LayoutOptions {
  readonly nodes: readonly NodeData[];
  readonly edges: readonly EdgeData[];
  readonly padding?: number | undefined;
  readonly theme?: GraphTheme | undefined;
  readonly layout?: GraphConfig['layout'] | undefined;
  readonly width?: number | undefined;
  readonly height?: number | undefined;
  readonly layoutDirection?: GraphConfig['layoutDirection'] | undefined;
  readonly nodeSizing?: GraphConfig['nodeSizing'] | undefined;
  readonly fixedNodeSize?: GraphConfig['fixedNodeSize'] | undefined;
  readonly labelMeasurementPaddingX?: GraphConfig['labelMeasurementPaddingX'] | undefined;
  readonly labelMeasurementPaddingY?: GraphConfig['labelMeasurementPaddingY'] | undefined;
  readonly labelMeasurementCharWidth?: GraphConfig['labelMeasurementCharWidth'] | undefined;
  readonly labelMeasurementLineHeight?: GraphConfig['labelMeasurementLineHeight'] | undefined;
}

export interface GraphTopology {
  readonly incoming: ReadonlyMap<string, number>;
  readonly outgoing: ReadonlyMap<string, readonly string[]>;
}

export interface TreeMetrics {
  readonly maxLevel: number;
  readonly maxNodeHeight: number;
  readonly maxLevelCount: number;
  readonly totalHeight: number;
  readonly baseY: number;
}
