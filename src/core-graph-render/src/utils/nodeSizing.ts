import type { LayoutOptions, NodeData, Size } from '@graph-render/types';
import { NodeSizingMode } from '@graph-render/types';

import {
  DEFAULT_LABEL_CHAR_WIDTH,
  DEFAULT_LABEL_LINE_HEIGHT,
  DEFAULT_LABEL_PADDING_X,
  DEFAULT_LABEL_PADDING_Y,
  DEFAULT_NODE_SIZE,
  MAX_MEASUREMENT_CHARS_PER_LINE,
  MAX_MEASUREMENT_LINES,
  MAX_MEASUREMENT_TEXT_LENGTH,
} from './constants';

const clampSize = (value: Size, fallback: Size): Size => ({
  width: Number.isFinite(value.width) && value.width > 0 ? value.width : fallback.width,
  height: Number.isFinite(value.height) && value.height > 0 ? value.height : fallback.height,
});

const getNodeLabel = (node: NodeData): string => {
  if (typeof node.measurementHints?.label === 'string') {
    return node.measurementHints.label;
  }

  if (typeof node.label === 'string' || typeof node.label === 'number') {
    return String(node.label);
  }

  return node.id;
};

const getMeasuredLines = (label: string): readonly string[] => {
  const truncatedLabel = label.slice(0, MAX_MEASUREMENT_TEXT_LENGTH);
  const rawLines = truncatedLabel.split(/\r?\n/);
  const measuredLines: string[] = [];

  for (
    let index = 0;
    index < rawLines.length && measuredLines.length < MAX_MEASUREMENT_LINES;
    index += 1
  ) {
    const codePoints = [...(rawLines[index] ?? '')];
    if (codePoints.length === 0) {
      continue;
    }

    measuredLines.push(codePoints.slice(0, MAX_MEASUREMENT_CHARS_PER_LINE).join(''));
  }

  return measuredLines.length > 0 ? measuredLines : [''];
};

const estimateLabelSize = (node: NodeData, options: LayoutOptions): Size => {
  const label = getNodeLabel(node);
  const lines = getMeasuredLines(label);
  const paddingX =
    node.measurementHints?.paddingX ?? options.labelMeasurementPaddingX ?? DEFAULT_LABEL_PADDING_X;
  const paddingY =
    node.measurementHints?.paddingY ?? options.labelMeasurementPaddingY ?? DEFAULT_LABEL_PADDING_Y;
  const charWidth =
    node.measurementHints?.estimatedCharWidth ??
    options.labelMeasurementCharWidth ??
    DEFAULT_LABEL_CHAR_WIDTH;
  const lineHeight =
    node.measurementHints?.lineHeight ??
    options.labelMeasurementLineHeight ??
    DEFAULT_LABEL_LINE_HEIGHT;
  let maxChars = 1;
  for (const line of lines) {
    const lineLength = [...line].length;
    if (lineLength > maxChars) {
      maxChars = lineLength;
    }
  }
  const lineCount = Math.max(1, lines.length);

  return {
    width: Math.max(DEFAULT_NODE_SIZE.width, Math.ceil(maxChars * charWidth + paddingX * 2)),
    height: Math.max(DEFAULT_NODE_SIZE.height, Math.ceil(lineCount * lineHeight + paddingY * 2)),
  };
};

const getResolvedSize = (node: NodeData, options: LayoutOptions): Size => {
  const mode = node.sizeMode ?? options.nodeSizing ?? NodeSizingMode.Fixed;
  const fixedSize = options.fixedNodeSize ?? DEFAULT_NODE_SIZE;
  const explicitSize = node.size ? clampSize(node.size, fixedSize) : null;
  const measuredSize = node.measuredSize ? clampSize(node.measuredSize, fixedSize) : null;
  const estimatedSize = estimateLabelSize(node, options);

  if (mode === NodeSizingMode.Measured) {
    return measuredSize ?? explicitSize ?? estimatedSize;
  }

  if (mode === NodeSizingMode.Label) {
    return explicitSize ?? estimatedSize;
  }

  return explicitSize ?? fixedSize;
};

export const applyNodeSizing = (
  nodes: readonly NodeData[],
  options: LayoutOptions
): readonly NodeData[] => {
  return nodes.map((node) => ({
    ...node,
    size: getResolvedSize(node, options),
  }));
};
