import { PositionedNode, EdgeType } from '@graph-render/types';
import type { NodeRenderer, EdgeRenderer } from '@graph-render/types';
import { escapeXml } from './utils';
import {
  DEFAULT_NODE_WIDTH,
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_RADIUS,
  DEFAULT_NODE_FILL,
  DEFAULT_NODE_STROKE,
  DEFAULT_TEXT_FILL,
  DEFAULT_TEXT_SIZE,
} from '../utils';

const MAX_RENDER_LABEL_LENGTH = 2_000;
const MAX_RENDER_LABEL_LINES = 8;

/**
 * Extract label from node data
 */
const getNodeLabel = (node: PositionedNode): string => {
  if (typeof node.label === 'string' || typeof node.label === 'number') {
    return String(node.label);
  }
  return node.id;
};

const getRenderableLabelLines = (label: string): string[] => {
  const truncated = label.slice(0, MAX_RENDER_LABEL_LENGTH);
  const lines = truncated
    .split(/\r?\n/)
    .slice(0, MAX_RENDER_LABEL_LINES)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.length ? lines : [''];
};

/**
 * Get node dimensions
 */
const getNodeDimensions = (node: PositionedNode): { width: number; height: number } => {
  return {
    width: node.size?.width ?? DEFAULT_NODE_WIDTH,
    height: node.size?.height ?? DEFAULT_NODE_HEIGHT,
  };
};

/**
 * Create SVG rectangle element for node
 */
const createNodeRect = (width: number, height: number, radius: number): string => {
  return `<rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="${DEFAULT_NODE_FILL}" stroke="${DEFAULT_NODE_STROKE}" stroke-width="1" />`;
};

/**
 * Create SVG text element for node label
 */
const createNodeText = (label: string, width: number, height: number): string => {
  const lines = getRenderableLabelLines(label);
  const x = width / 2;
  const lineHeight = DEFAULT_TEXT_SIZE + 4;
  const firstLineY = height / 2 - ((lines.length - 1) * lineHeight) / 2 + 4;
  const tspans = lines
    .map(
      (line, index) =>
        `<tspan x="${x}" y="${firstLineY + index * lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join('');

  return `<text x="${x}" fill="${DEFAULT_TEXT_FILL}" font-size="${DEFAULT_TEXT_SIZE}" font-weight="600" text-anchor="middle">${tspans}</text>`;
};

/**
 * Default node renderer - creates a rounded rectangle with centered text
 */
export const defaultNodeRenderer: NodeRenderer = (node) => {
  const { width, height } = getNodeDimensions(node);
  const label = getNodeLabel(node);
  const rect = createNodeRect(width, height, DEFAULT_NODE_RADIUS);
  const text = createNodeText(label, width, height);
  return [rect, text].join('');
};

/**
 * Determine if edge should have an arrow marker
 */
const shouldShowArrow = (edgeType?: EdgeType): boolean => {
  return edgeType === EdgeType.Directed;
};

/**
 * Create marker-end attribute for directed edges
 */
const createMarkerAttribute = (markerId: string): string => {
  return ` marker-end="url(#${markerId})"`;
};

/**
 * Default edge renderer - creates an SVG path with optional arrow marker
 */
export const defaultEdgeRenderer: EdgeRenderer = (edge, pathD, theme) => {
  const marker =
    shouldShowArrow(edge.type) && theme.markerId ? createMarkerAttribute(theme.markerId) : '';
  const path = `<path d="${pathD}" stroke="${theme.edgeColor}" stroke-width="${theme.edgeWidth}" fill="none"${marker}/>`;
  const label =
    edge.label != null && edge.labelPosition
      ? `<text x="${edge.labelPosition.x}" y="${edge.labelPosition.y - 6}" fill="${theme.edgeLabelColor}" font-size="12" font-weight="600" text-anchor="middle">${escapeXml(String(edge.label))}</text>`
      : '';
  return `${path}${label}`;
};
