import { LayoutOptions, NodeData, Size } from '@graph-render/types';
import { DEFAULT_NODE_SIZE } from './constants';

const DEFAULT_PADDING_X = 18;
const DEFAULT_PADDING_Y = 12;
const DEFAULT_CHAR_WIDTH = 8;
const DEFAULT_LINE_HEIGHT = 18;
const MAX_MEASUREMENT_TEXT_LENGTH = 4_000;
const MAX_MEASUREMENT_LINES = 200;
const MAX_MEASUREMENT_CHARS_PER_LINE = 400;

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

const getMeasuredLines = (label: string): string[] => {
  const truncatedLabel = label.slice(0, MAX_MEASUREMENT_TEXT_LENGTH);
  const rawLines = truncatedLabel.split(/\r?\n/);
  const measuredLines: string[] = [];

  for (
    let index = 0;
    index < rawLines.length && measuredLines.length < MAX_MEASUREMENT_LINES;
    index += 1
  ) {
    const codePoints = Array.from(rawLines[index]);
    if (!codePoints.length) {
      continue;
    }

    measuredLines.push(codePoints.slice(0, MAX_MEASUREMENT_CHARS_PER_LINE).join(''));
  }

  return measuredLines.length ? measuredLines : [''];
};

const estimateLabelSize = (node: NodeData, options: LayoutOptions): Size => {
  const label = getNodeLabel(node);
  const lines = getMeasuredLines(label);
  const paddingX =
    node.measurementHints?.paddingX ?? options.labelMeasurementPaddingX ?? DEFAULT_PADDING_X;
  const paddingY =
    node.measurementHints?.paddingY ?? options.labelMeasurementPaddingY ?? DEFAULT_PADDING_Y;
  const charWidth =
    node.measurementHints?.estimatedCharWidth ??
    options.labelMeasurementCharWidth ??
    DEFAULT_CHAR_WIDTH;
  const lineHeight =
    node.measurementHints?.lineHeight ?? options.labelMeasurementLineHeight ?? DEFAULT_LINE_HEIGHT;
  let maxChars = 1;
  for (const line of lines) {
    const lineLength = Array.from(line).length;
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
  const mode = node.sizeMode ?? options.nodeSizing ?? 'fixed';
  const fixedSize = options.fixedNodeSize ?? DEFAULT_NODE_SIZE;
  const explicitSize = node.size ? clampSize(node.size, fixedSize) : null;
  const measuredSize = node.measuredSize ? clampSize(node.measuredSize, fixedSize) : null;
  const estimatedSize = estimateLabelSize(node, options);

  if (mode === 'measured') {
    return measuredSize ?? explicitSize ?? estimatedSize;
  }

  if (mode === 'label') {
    return explicitSize ?? estimatedSize;
  }

  return explicitSize ?? fixedSize;
};

export const applyNodeSizing = (nodes: NodeData[], options: LayoutOptions): NodeData[] => {
  return nodes.map((node) => ({
    ...node,
    size: getResolvedSize(node, options),
  }));
};
