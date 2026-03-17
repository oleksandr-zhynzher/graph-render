import { EdgeData, NodeData, Point, PositionedNode } from '@graph-render/types';
import { DEFAULT_NODE_GAP, DEFAULT_NODE_SIZE, DEFAULT_PADDING } from '../utils';
import { gridLayout } from './grid';

const FORCE_LAYOUT_CACHE_LIMIT = 24;
const MAX_SYNC_FORCE_NODES = 250;
// NOTE: this cache is intentionally module-level so warm hits persist across
// sequential renders of the same graph (common during viewport-only updates).
// Trade-off: all <Graph> instances in the same JS bundle share the same 24-slot
// LRU.  Keys include the full node/edge topology, so stale hits are extremely
// unlikely.  If you mount many independent graphs with similar-but-distinct
// topologies and see layout lag, increase FORCE_LAYOUT_CACHE_LIMIT.
const forceLayoutCache = new Map<string, PositionedNode[]>();

const buildForceLayoutCacheKey = (
  nodes: NodeData[],
  edges: EdgeData[],
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

const getCachedForceLayout = (cacheKey: string | null): PositionedNode[] | undefined => {
  if (!cacheKey) {
    return undefined;
  }

  const cached = forceLayoutCache.get(cacheKey);
  if (!cached) {
    return undefined;
  }

  forceLayoutCache.delete(cacheKey);
  forceLayoutCache.set(cacheKey, cached);
  return cached.map((node) => ({
    ...node,
    position: { ...node.position },
    size: node.size ? { ...node.size } : undefined,
  }));
};

const setCachedForceLayout = (cacheKey: string | null, nodes: PositionedNode[]): void => {
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
    nodes.map((node) => ({
      ...node,
      position: { ...node.position },
      size: node.size ? { ...node.size } : undefined,
    }))
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

  return {
    x: Math.min(Math.max(point.x, pad), width - pad - nodeWidth),
    y: Math.min(Math.max(point.y, pad), height - pad - nodeHeight),
  };
};

export const forceDirectedLayout = (
  nodes: NodeData[],
  edges: EdgeData[],
  pad: number = DEFAULT_PADDING,
  width: number = 960,
  height: number = 720,
  gap: number = DEFAULT_NODE_GAP
): PositionedNode[] => {
  if (!nodes.length) {
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
  const positions = new Map<string, Point>();
  // FIX: removed the `adjacency` Map that was built here but never read by the
  // algorithm.  Repulsion iterates node pairs directly; attraction iterates the
  // `edges` array directly.  Building the map was O(e) wasted work per layout call.

  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / Math.max(nodes.length, 1);
    const radius = Math.min(width, height) * 0.25;
    positions.set(node.id, {
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle),
    });
  });

  // FIX: removed the edges.forEach that populated `adjacency` (now deleted).
  // The attraction-force loop below already iterates `edges` directly.
  for (let iteration = 0; iteration < 80; iteration += 1) {
    const displacement = new Map<string, Point>();
    nodes.forEach((node) => displacement.set(node.id, { x: 0, y: 0 }));

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const source = nodes[i];
        const target = nodes[j];
        const sourcePos = positions.get(source.id) as Point;
        const targetPos = positions.get(target.id) as Point;
        const dx = sourcePos.x - targetPos.x;
        const dy = sourcePos.y - targetPos.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const force = (k * k) / distance;
        const offsetX = (dx / distance) * force;
        const offsetY = (dy / distance) * force;
        const sourceDisp = displacement.get(source.id) as Point;
        const targetDisp = displacement.get(target.id) as Point;
        sourceDisp.x += offsetX;
        sourceDisp.y += offsetY;
        targetDisp.x -= offsetX;
        targetDisp.y -= offsetY;
      }
    }

    edges.forEach((edge) => {
      const sourcePos = positions.get(edge.source) as Point;
      const targetPos = positions.get(edge.target) as Point;
      const dx = sourcePos.x - targetPos.x;
      const dy = sourcePos.y - targetPos.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const force = (distance * distance) / k;
      const offsetX = (dx / distance) * force;
      const offsetY = (dy / distance) * force;
      const sourceDisp = displacement.get(edge.source) as Point;
      const targetDisp = displacement.get(edge.target) as Point;
      sourceDisp.x -= offsetX;
      sourceDisp.y -= offsetY;
      targetDisp.x += offsetX;
      targetDisp.y += offsetY;
    });

    const temperature = Math.max(2, gap * (1 - iteration / 80));
    nodes.forEach((node) => {
      const point = positions.get(node.id) as Point;
      const disp = displacement.get(node.id) as Point;
      const magnitude = Math.max(1, Math.hypot(disp.x, disp.y));
      const nextPoint = {
        x: point.x + (disp.x / magnitude) * Math.min(magnitude, temperature),
        y: point.y + (disp.y / magnitude) * Math.min(magnitude, temperature),
      };
      positions.set(node.id, clampPoint(nextPoint, width, height, pad, node));
    });
  }

  const positionedNodes = nodes.map((node) => {
    const point = positions.get(node.id) as Point;
    const size = node.size ?? DEFAULT_NODE_SIZE;

    return {
      ...node,
      position: {
        x: point.x - size.width / 2,
        y: point.y - size.height / 2,
      },
    } as PositionedNode;
  });

  setCachedForceLayout(cacheKey, positionedNodes);

  return positionedNodes;
};
