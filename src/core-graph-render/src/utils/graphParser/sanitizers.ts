import type { EdgeData, NodeData } from '@graph-render/types';
import { isFiniteNumber, isPlainObject } from './guards';
import type { GraphNodeTuple } from './types';

export const sanitizeNodeId = (value: string, kind: 'node' | 'edge-endpoint'): string => {
  const normalized = value.trim();
  if (!normalized) {
    throw new TypeError(`Graph ${kind} identifiers must be non-empty strings.`);
  }

  return normalized;
};

export const sanitizePoint = (value: unknown): { x: number; y: number } | undefined => {
  if (!isPlainObject(value) || !isFiniteNumber(value.x) || !isFiniteNumber(value.y)) {
    return undefined;
  }

  return { x: value.x, y: value.y };
};

const sanitizeSize = (value: unknown): { width: number; height: number } | undefined => {
  if (!isPlainObject(value) || !isFiniteNumber(value.width) || !isFiniteNumber(value.height)) {
    return undefined;
  }

  return value.width > 0 && value.height > 0
    ? { width: value.width, height: value.height }
    : undefined;
};

export const sanitizeRecord = <T extends Record<string, unknown>>(
  value: unknown
): T | undefined => {
  return isPlainObject(value) ? (value as T) : undefined;
};

const sanitizeMeasurementHints = (value: unknown): NodeData['measurementHints'] | undefined => {
  if (!isPlainObject(value)) return undefined;

  return {
    label: typeof value.label === 'string' ? value.label : undefined,
    paddingX: isFiniteNumber(value.paddingX) && value.paddingX >= 0 ? value.paddingX : undefined,
    paddingY: isFiniteNumber(value.paddingY) && value.paddingY >= 0 ? value.paddingY : undefined,
    estimatedCharWidth:
      isFiniteNumber(value.estimatedCharWidth) && value.estimatedCharWidth > 0
        ? value.estimatedCharWidth
        : undefined,
    lineHeight:
      isFiniteNumber(value.lineHeight) && value.lineHeight > 0 ? value.lineHeight : undefined,
  };
};

export const sanitizeNodeData = <TNodeData, TNodeMeta extends Record<string, unknown>, TNodeLabel>(
  id: string,
  attrs: Record<string, unknown>
): GraphNodeTuple<TNodeData, TNodeMeta, TNodeLabel> => {
  return {
    id,
    label: attrs.label as TNodeLabel | undefined,
    position: sanitizePoint(attrs.position),
    size: sanitizeSize(attrs.size),
    measuredSize: sanitizeSize(attrs.measuredSize),
    sizeMode:
      attrs.sizeMode === 'fixed' || attrs.sizeMode === 'label' || attrs.sizeMode === 'measured'
        ? attrs.sizeMode
        : undefined,
    measurementHints: sanitizeMeasurementHints(attrs.measurementHints),
    data: attrs.data as TNodeData | undefined,
    meta: sanitizeRecord<TNodeMeta>(attrs.meta),
  };
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
