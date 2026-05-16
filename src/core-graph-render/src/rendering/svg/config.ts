import type { RenderConfig, RenderGraphToSvgOptions, RenderTheme } from '@graph-render/types';
import { DEFAULT_THEME, normalizeGraphConfig } from '../../utils';
import { escapeXml, sanitizeCssColor, sanitizeFontFamily, sanitizeSvgId } from '../utils';

export const extractRenderConfig = (options?: RenderGraphToSvgOptions): RenderConfig => {
  const cfg = normalizeGraphConfig(options?.config);
  const mergedTheme = { ...DEFAULT_THEME, ...(cfg.theme ?? {}) };
  const safeFontFamily = escapeXml(
    sanitizeFontFamily(mergedTheme.fontFamily, DEFAULT_THEME.fontFamily)
  );

  return {
    width: cfg.width,
    height: cfg.height,
    padding: cfg.padding,
    defaultEdgeType: cfg.defaultEdgeType,
    failureBehavior: cfg.failureBehavior,
    inputValidationMode: cfg.inputValidationMode,
    curveEdges: cfg.curveEdges,
    curveStrength: cfg.curveStrength,
    arrowPadding: cfg.arrowPadding,
    showArrows: cfg.showArrows,
    nodeSizing: cfg.nodeSizing,
    fixedNodeSize: cfg.fixedNodeSize,
    labelMeasurementPaddingX: cfg.labelMeasurementPaddingX,
    labelMeasurementPaddingY: cfg.labelMeasurementPaddingY,
    labelMeasurementCharWidth: cfg.labelMeasurementCharWidth,
    labelMeasurementLineHeight: cfg.labelMeasurementLineHeight,
    routingStyle: cfg.routingStyle,
    edgeSeparation: cfg.edgeSeparation,
    selfLoopRadius: cfg.selfLoopRadius,
    layout: cfg.layout,
    layoutDirection: cfg.layoutDirection,
    forceRightToLeft: cfg.forceRightToLeft,
    markerId: sanitizeSvgId(options?.markerId ?? 'arrow', 'arrow'),
    edgeLabelColor: cfg.edgeLabelColor,
    mergedTheme,
    safeFontFamily,
  };
};

export const extractRenderTheme = (config: RenderConfig): RenderTheme => {
  return {
    edgeColor: sanitizeCssColor(config.mergedTheme.edgeColor, DEFAULT_THEME.edgeColor),
    edgeWidth: config.mergedTheme.edgeWidth ?? DEFAULT_THEME.edgeWidth,
    edgeLabelColor: sanitizeCssColor(config.edgeLabelColor, '#334155'),
    background: sanitizeCssColor(config.mergedTheme.background, DEFAULT_THEME.background),
  };
};
