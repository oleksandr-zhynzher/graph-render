import type { RenderConfig, RenderGraphToSvgOptions, RenderTheme } from '@graph-render/types';

import { DEFAULT_THEME, normalizeGraphConfig } from '../../utils';
import { escapeXml, sanitizeCssColor, sanitizeFontFamily, sanitizeSvgId } from '../utils';

export const extractRenderConfig = (options?: RenderGraphToSvgOptions): RenderConfig => {
  const cfg = normalizeGraphConfig(options?.config);
  const mergedTheme = {
    ...cfg.theme,
    background: cfg.theme.background ?? DEFAULT_THEME.background ?? '#0c0c10',
    edgeColor: cfg.theme.edgeColor ?? DEFAULT_THEME.edgeColor ?? '#8b9dbf',
    edgeWidth: cfg.theme.edgeWidth ?? DEFAULT_THEME.edgeWidth ?? 2,
    nodeGap: cfg.theme.nodeGap ?? DEFAULT_THEME.nodeGap,
    fontFamily: cfg.theme.fontFamily ?? DEFAULT_THEME.fontFamily ?? 'system-ui, sans-serif',
  };
  const safeFontFamily = escapeXml(
    sanitizeFontFamily(mergedTheme.fontFamily, DEFAULT_THEME.fontFamily ?? 'system-ui, sans-serif')
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
    edgeColor: sanitizeCssColor(config.mergedTheme.edgeColor, DEFAULT_THEME.edgeColor ?? '#8b9dbf'),
    edgeWidth: config.mergedTheme.edgeWidth,
    edgeLabelColor: sanitizeCssColor(config.edgeLabelColor, '#334155'),
    background: sanitizeCssColor(
      config.mergedTheme.background,
      DEFAULT_THEME.background ?? '#0c0c10'
    ),
  };
};
