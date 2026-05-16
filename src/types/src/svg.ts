import type {
  EdgeRenderer,
  EdgeType,
  GraphConfig,
  GraphFailureBehavior,
  GraphInputValidationMode,
  LayoutDirection,
  LayoutType,
  NodeRenderer,
  NodeSizingMode,
  PositionedEdge,
  PositionedNode,
  Size,
} from './index';

/**
 * Options for rendering a graph to SVG
 */
export interface RenderGraphToSvgOptions<
  TNode extends PositionedNode = PositionedNode,
  TEdge extends PositionedEdge = PositionedEdge,
> {
  readonly config?: GraphConfig | undefined;
  readonly vertexRenderer?: NodeRenderer<TNode> | undefined;
  readonly edgeRenderer?: EdgeRenderer<TEdge> | undefined;
  readonly markerId?: string | undefined;
  readonly title?: string | undefined;
  readonly desc?: string | undefined;
}

/**
 * Result of rendering a graph to SVG
 */
export interface RenderGraphToSvgResult {
  readonly svg: string;
  readonly width: number;
  readonly height: number;
  readonly nodes: readonly PositionedNode[];
  readonly edges: readonly PositionedEdge[];
}

/**
 * Internal render configuration with all required properties
 */
export interface RenderConfig {
  readonly width: number;
  readonly height: number;
  readonly padding: number | undefined;
  readonly defaultEdgeType: EdgeType;
  readonly failureBehavior: GraphFailureBehavior;
  readonly inputValidationMode: GraphInputValidationMode;
  readonly curveEdges: boolean;
  readonly curveStrength: number;
  readonly arrowPadding: number;
  readonly showArrows: boolean;
  readonly nodeSizing: NodeSizingMode;
  readonly fixedNodeSize: Size;
  readonly labelMeasurementPaddingX: number;
  readonly labelMeasurementPaddingY: number;
  readonly labelMeasurementCharWidth: number;
  readonly labelMeasurementLineHeight: number;
  readonly routingStyle: NonNullable<GraphConfig['routingStyle']>;
  readonly edgeSeparation: number;
  readonly selfLoopRadius: number;
  readonly layout: LayoutType;
  readonly layoutDirection: LayoutDirection;
  readonly forceRightToLeft?: boolean | undefined;
  readonly markerId: string;
  readonly edgeLabelColor: string;
  readonly mergedTheme: {
    readonly background: string;
    readonly edgeColor: string;
    readonly edgeWidth: number;
    readonly fontFamily: string;
    readonly nodeGap: number;
  };
  readonly safeFontFamily: string;
}

/**
 * Theme properties used during rendering
 */
export interface RenderTheme {
  readonly edgeColor: string;
  readonly edgeWidth: number;
  readonly edgeLabelColor: string;
  readonly background: string;
}
