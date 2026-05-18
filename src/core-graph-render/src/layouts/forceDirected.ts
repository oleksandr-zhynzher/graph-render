import type { EdgeData, NodeData, Point, PositionedNode } from '@graph-render/types';

import { DEFAULT_NODE_GAP, DEFAULT_NODE_SIZE, DEFAULT_PADDING } from '../utils';
import { FORCE_LAYOUT_CACHE_LIMIT, MAX_SYNC_FORCE_NODES } from '../utils/constants';
import { gridLayout } from './grid';

interface MutablePoint {
  x: number;
  y: number;
}
// NOTE: this cache is intentionally module-level so warm hits persist across
// sequential renders of the same graph (common during viewport-only updates).
// Trade-off: all <Graph> instances in the same JS bundle share the same 24-slot
// LRU.  Keys include the full node/edge topology, so stale hits are extremely
// unlikely.  If you mount many independent graphs with similar-but-distinct
// topologies and see layout lag, increase FORCE_LAYOUT_CACHE_LIMIT.
const forceLayoutCache = new Map<string, readonly PositionedNode[]>();

const buildForceLayoutCacheKey = (
  nodes: readonly NodeData[],
  edges: readonly EdgeData[],
  pad: number,
  width: number,
  height: number,
  gap: number
): string | null => {
  try {
    return JSON.stringify({
      pad,
      width,
      height,
      gap,
      nodes: nodes.map((node) => ({
        id: node.id,
        size: node.size,
        label: node.label,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
      })),
    });
  } catch {
    return null;
  }
};

const getCachedForceLayout = (cacheKey: string | null): readonly PositionedNode[] | undefined => {
  if (!cacheKey) {
    return undefined;
  }

  const cached = forceLayoutCache.get(cacheKey);
  if (!cached) {
    return undefined;
  }

  forceLayoutCache.delete(cacheKey);
  forceLayoutCache.set(cacheKey, cached);
  return cached.map((node) => {
    const size = node.size ? { ...node.size } : undefined;
    return {
      ...node,
      position: { ...node.position },
      ...(size ? { size } : {}),
    };
  });
};

const setCachedForceLayout = (cacheKey: string | null, nodes: readonly PositionedNode[]): void => {
  if (!cacheKey) {
    return;
  }

  if (forceLayoutCache.size >= FORCE_LAYOUT_CACHE_LIMIT) {
    const oldestKey = forceLayoutCache.keys().next().value;
    if (oldestKey) {
      forceLayoutCache.delete(oldestKey);
    }
  }

  forceLayoutCache.set(
    cacheKey,
    nodes.map((node) => {
      const size = node.size ? { ...node.size } : undefined;
      return {
        ...node,
        position: { ...node.position },
        ...(size ? { size } : {}),
      };
    })
  );
};

const clampPoint = (
  point: Point,
  width: number,
  height: number,
  pad: number,
  node: NodeData
): Point => {
  const nodeWidth = node.size?.width ?? DEFAULT_NODE_SIZE.width;
  const nodeHeight = node.size?.height ?? DEFAULT_NODE_SIZE.height;
  // `point` is the node center in force-directed simulation space.
  // Clamp so that the full node rectangle stays within the padded viewport.
  const halfW = nodeWidth / 2;
  const halfH = nodeHeight / 2;

  return {
    x: Math.min(Math.max(point.x, pad + halfW), width - pad - halfW),
    y: Math.min(Math.max(point.y, pad + halfH), height - pad - halfH),
  };
};

const getRequiredPoint = <TPoint extends Point>(
  points: ReadonlyMap<string, TPoint>,
  nodeId: string
): TPoint => {
  const point = points.get(nodeId);

  if (!point) {
    throw new Error(`Force-directed layout could not resolve point data for node "${nodeId}".`);
  }

  return point;
};

export const forceDirectedLayout = (
  nodes: readonly NodeData[],
  edges: readonly EdgeData[],
  pad: number = DEFAULT_PADDING,
  width = 960,
  height = 720,
  gap: number = DEFAULT_NODE_GAP
): readonly PositionedNode[] => {
  if (nodes.length === 0) {
    return [];
  }

  if (nodes.length > MAX_SYNC_FORCE_NODES) {
    return gridLayout(nodes, pad, gap);
  }

  const cacheKey = buildForceLayoutCacheKey(nodes, edges, pad, width, height, gap);
  const cached = getCachedForceLayout(cacheKey);
  if (cached) {
    return cached;
  }

  const area = Math.max((width - pad * 2) * (height - pad * 2), 1);
  const k = Math.sqrt(area / Math.max(nodes.length, 1));
  const positions = new Map<string, MutablePoint>();
  // FIX: removed the `adjacency` Map that was built here but never read by the
  // algorithm.  Repulsion iterates node pairs directly; attraction iterates the
  // `edges` array directly.  Building the map was O(e) wasted work per layout call.

  for (const [index, node] of nodes.entries()) {
    const angle = (2 * Math.PI * index) / Math.max(nodes.length, 1);
    const radius = Math.min(width, height) * 0.25;
    positions.set(node.id, {
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle),
    });
  }

  // FIX: removed the edges.forEach that populated `adjacency` (now deleted).
  // The attraction-force loop below already iterates `edges` directly.
  for (let iteration = 0; iteration < 80; iteration += 1) {
    const displacement = new Map<string, MutablePoint>();
    for (const node of nodes) displacement.set(node.id, { x: 0, y: 0 });

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const source = nodes[i];
        const target = nodes[j];
        if (!source || !target) {
          continue;
        }
        const sourcePos = getRequiredPoint(positions, source.id);
        const targetPos = getRequiredPoint(positions, target.id);
        const dx = sourcePos.x - targetPos.x;
        const dy = sourcePos.y - targetPos.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const force = (k * k) / distance;
        const offsetX = (dx / distance) * force;
        const offsetY = (dy / distance) * force;
        const sourceDisp = getRequiredPoint(displacement, source.id);
        const targetDisp = getRequiredPoint(displacement, target.id);
        sourceDisp.x += offsetX;
        sourceDisp.y += offsetY;
        targetDisp.x -= offsetX;
        targetDisp.y -= offsetY;
      }
    }

    for (const edge of edges) {
      const sourcePos = getRequiredPoint(positions, edge.source);
      const targetPos = getRequiredPoint(positions, edge.target);
      const dx = sourcePos.x - targetPos.x;
      const dy = sourcePos.y - targetPos.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const force = (distance * distance) / k;
      const offsetX = (dx / distance) * force;
      const offsetY = (dy / distance) * force;
      const sourceDisp = getRequiredPoint(displacement, edge.source);
      const targetDisp = getRequiredPoint(displacement, edge.target);
      sourceDisp.x -= offsetX;
      sourceDisp.y -= offsetY;
      targetDisp.x += offsetX;
      targetDisp.y += offsetY;
    }

    const temperature = Math.max(2, gap * (1 - iteration / 80));
    for (const node of nodes) {
      const point = getRequiredPoint(positions, node.id);
      const disp = getRequiredPoint(displacement, node.id);
      const magnitude = Math.max(1, Math.hypot(disp.x, disp.y));
      const nextPoint = {
        x: point.x + (disp.x / magnitude) * Math.min(magnitude, temperature),
        y: point.y + (disp.y / magnitude) * Math.min(magnitude, temperature),
      };
      positions.set(node.id, clampPoint(nextPoint, width, height, pad, node));
    }
  }

  const positionedNodes = nodes.map((node) => {
    const point = getRequiredPoint(positions, node.id);
    const size = node.size ?? DEFAULT_NODE_SIZE;

    return {
      ...node,
      position: {
        x: point.x - size.width / 2,
        y: point.y - size.height / 2,
      },
    };
  });

  setCachedForceLayout(cacheKey, positionedNodes);

  return positionedNodes;
};
