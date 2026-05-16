import type { EdgeData, NodeData } from '@graph-render/types';
import { NodeSizingMode } from '@graph-render/types';

import { isFiniteNumber, isPlainObject } from './guards';
import type { GraphNodeTuple } from './types';

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

export const sanitizeNodeId = (value: string, kind: 'node' | 'edge-endpoint'): string => {
  const normalized = value.trim();
  if (!normalized) {
    throw new TypeError(`Graph ${kind} identifiers must be non-empty strings.`);
  }

  return normalized;
};

export const sanitizePoint = (
  value: unknown
): { readonly x: number; readonly y: number } | undefined => {
  if (!isPlainObject(value)) {
    return undefined;
  }

  const x = value['x'];
  const y = value['y'];
  return isFiniteNumber(x) && isFiniteNumber(y) ? { x, y } : undefined;
};

const sanitizeSize = (
  value: unknown
): { readonly width: number; readonly height: number } | undefined => {
  if (!isPlainObject(value)) {
    return undefined;
  }

  const width = value['width'];
  const height = value['height'];
  return isFiniteNumber(width) && isFiniteNumber(height) && width > 0 && height > 0
    ? { width, height }
    : undefined;
};

export const sanitizeRecord = <T extends Record<string, unknown>>(
  value: unknown
): T | undefined => {
  return isPlainObject(value) ? (value as T) : undefined;
};

const sanitizeMeasurementHints = (value: unknown): NodeData['measurementHints'] | undefined => {
  if (!isPlainObject(value)) return undefined;

  const hints: Mutable<NonNullable<NodeData['measurementHints']>> = {};
  const label = value['label'];
  const paddingX = value['paddingX'];
  const paddingY = value['paddingY'];
  const estimatedCharWidth = value['estimatedCharWidth'];
  const lineHeight = value['lineHeight'];

  if (typeof label === 'string') hints.label = label;
  if (isFiniteNumber(paddingX) && paddingX >= 0) hints.paddingX = paddingX;
  if (isFiniteNumber(paddingY) && paddingY >= 0) hints.paddingY = paddingY;
  if (isFiniteNumber(estimatedCharWidth) && estimatedCharWidth > 0) {
    hints.estimatedCharWidth = estimatedCharWidth;
  }
  if (isFiniteNumber(lineHeight) && lineHeight > 0) hints.lineHeight = lineHeight;

  return Object.keys(hints).length > 0 ? hints : undefined;
};

export const sanitizeNodeData = <TNodeData, TNodeMeta extends Record<string, unknown>, TNodeLabel>(
  id: string,
  attrs: Record<string, unknown>
): GraphNodeTuple<TNodeData, TNodeMeta, TNodeLabel> => {
  const node: Mutable<GraphNodeTuple<TNodeData, TNodeMeta, TNodeLabel>> = {
    id,
  };
  const label = attrs['label'];
  const position = sanitizePoint(attrs['position']);
  const size = sanitizeSize(attrs['size']);
  const measuredSize = sanitizeSize(attrs['measuredSize']);
  const sizeMode = attrs['sizeMode'];
  const measurementHints = sanitizeMeasurementHints(attrs['measurementHints']);
  const data = attrs['data'];
  const meta = sanitizeRecord<TNodeMeta>(attrs['meta']);

  if (label !== undefined) node.label = label as TNodeLabel;
  if (position) node.position = position;
  if (size) node.size = size;
  if (measuredSize) node.measuredSize = measuredSize;
  if (
    sizeMode === NodeSizingMode.Fixed ||
    sizeMode === NodeSizingMode.Label ||
    sizeMode === NodeSizingMode.Measured
  )
    node.sizeMode = sizeMode;
  if (measurementHints) node.measurementHints = measurementHints;
  if (data !== undefined) node.data = data as TNodeData;
  if (meta) node.meta = meta;

  return node;
};

export const sanitizeEdgePoints = (value: unknown): EdgeData['points'] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const points = value
    .map((point) => sanitizePoint(point))
    .filter((point): point is NonNullable<EdgeData['points']>[number] => point !== undefined);
  return points.length >= 2 ? points : undefined;
};
