import { NxGraphInput, NodeData, EdgeData, NxEdgeAttrs, EdgeType } from '@graph-render/types';

type GraphNodeTuple<TNodeData, TNodeMeta extends Record<string, unknown>, TNodeLabel> = NodeData<
  TNodeData,
  TNodeMeta,
  TNodeLabel
>;

type GraphEdgeTuple<TEdgeMeta extends Record<string, unknown>, TEdgeLabel> = EdgeData<
  TEdgeMeta,
  TEdgeLabel
>;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const sanitizeNodeId = (value: string, kind: 'node' | 'edge-endpoint'): string => {
  const normalized = value.trim();
  if (!normalized) {
    throw new TypeError(`Graph ${kind} identifiers must be non-empty strings.`);
  }

  return normalized;
};

const sanitizePoint = (value: unknown): { x: number; y: number } | undefined => {
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

const sanitizeRecord = <T extends Record<string, unknown>>(value: unknown): T | undefined => {
  return isPlainObject(value) ? (value as T) : undefined;
};

const sanitizeMeasurementHints = (value: unknown): NodeData['measurementHints'] | undefined => {
  if (!isPlainObject(value)) return undefined;
  // FIX: was a bare cast `(value as NodeData['measurementHints'])` that let
  // non-numeric values (e.g., paddingX: "8px") flow into layout arithmetic and
  // produce NaN node sizes.  Each field is now validated individually.
  return {
    label: typeof value.label === 'string' ? value.label : undefined,
    paddingX:
      isFiniteNumber(value.paddingX) && (value.paddingX as number) >= 0
        ? (value.paddingX as number)
        : undefined,
    paddingY:
      isFiniteNumber(value.paddingY) && (value.paddingY as number) >= 0
        ? (value.paddingY as number)
        : undefined,
    estimatedCharWidth:
      isFiniteNumber(value.estimatedCharWidth) && (value.estimatedCharWidth as number) > 0
        ? (value.estimatedCharWidth as number)
        : undefined,
    lineHeight:
      isFiniteNumber(value.lineHeight) && (value.lineHeight as number) > 0
        ? (value.lineHeight as number)
        : undefined,
  };
};

const sanitizeNodeData = <TNodeData, TNodeMeta extends Record<string, unknown>, TNodeLabel>(
  id: string,
  attrs: Record<string, unknown>
): GraphNodeTuple<TNodeData, TNodeMeta, TNodeLabel> => {
  const position = sanitizePoint(attrs.position);
  const size = sanitizeSize(attrs.size);
  const measuredSize = sanitizeSize(attrs.measuredSize);
  const measurementHints = sanitizeMeasurementHints(attrs.measurementHints);

  return {
    id,
    label: attrs.label,
    position,
    size,
    measuredSize,
    sizeMode:
      attrs.sizeMode === 'fixed' || attrs.sizeMode === 'label' || attrs.sizeMode === 'measured'
        ? attrs.sizeMode
        : undefined,
    measurementHints,
    data: attrs.data,
    meta: sanitizeRecord<TNodeMeta>(attrs.meta),
  } as GraphNodeTuple<TNodeData, TNodeMeta, TNodeLabel>;
};

const sanitizeEdgePoints = (value: unknown): EdgeData['points'] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const points = value
    .map((point) => sanitizePoint(point))
    .filter((point): point is NonNullable<EdgeData['points']>[number] => point !== undefined);
  return points.length >= 2 ? points : undefined;
};

const ensureUniqueEdgeId = (candidate: string, usedEdgeIds: Set<string>): string => {
  if (!usedEdgeIds.has(candidate)) {
    usedEdgeIds.add(candidate);
    return candidate;
  }

  let attempt = 2;
  let nextId = `${candidate}-${attempt}`;
  while (usedEdgeIds.has(nextId)) {
    attempt += 1;
    nextId = `${candidate}-${attempt}`;
  }

  usedEdgeIds.add(nextId);
  return nextId;
};

const assertValidGraphInput = (graph: NxGraphInput): void => {
  if (!isPlainObject(graph)) {
    throw new TypeError('Graph input must be a plain object.');
  }

  if (!isPlainObject(graph.adj)) {
    throw new TypeError('Graph input must include an adjacency map in `adj`.');
  }

  if (graph.nodes != null && !isPlainObject(graph.nodes)) {
    throw new TypeError('Graph `nodes` must be a record of node attributes when provided.');
  }

  for (const [source, neighbors] of Object.entries(graph.adj)) {
    if (!isPlainObject(neighbors)) {
      throw new TypeError(`Adjacency entry for node "${source}" must be an object.`);
    }

    for (const [target, rawAttrs] of Object.entries(neighbors)) {
      const attrsList = Array.isArray(rawAttrs) ? rawAttrs : [rawAttrs];
      if (!attrsList.length) {
        throw new TypeError(
          `Adjacency entry for edge "${source}" -> "${target}" must not be an empty array.`
        );
      }

      attrsList.forEach((attrs, index) => {
        if (attrs != null && !isPlainObject(attrs)) {
          throw new TypeError(
            `Edge attributes for "${source}" -> "${target}" at index ${index} must be an object.`
          );
        }
      });
    }
  }
};

/**
 * Build node map from graph node definitions
 */
const buildNodeMap = <
  TNodeData,
  TNodeMeta extends Record<string, unknown>,
  TNodeLabel,
  TEdgeMeta extends Record<string, unknown>,
  TEdgeLabel,
>(
  graph: NxGraphInput<TNodeData, TNodeMeta, TNodeLabel, TEdgeMeta, TEdgeLabel>
): Map<string, GraphNodeTuple<TNodeData, TNodeMeta, TNodeLabel>> => {
  const nodeMap = new Map<string, GraphNodeTuple<TNodeData, TNodeMeta, TNodeLabel>>();

  if (graph.nodes) {
    for (const [id, attrs] of Object.entries(graph.nodes)) {
      if (attrs != null && !isPlainObject(attrs)) {
        throw new TypeError(`Node attributes for "${id}" must be an object when provided.`);
      }

      const sanitizedId = sanitizeNodeId(id, 'node');
      nodeMap.set(
        sanitizedId,
        sanitizeNodeData<TNodeData, TNodeMeta, TNodeLabel>(sanitizedId, attrs ?? {})
      );
    }
  }

  return nodeMap;
};

/**
 * Ensure a node exists in the map, creating it if necessary
 */
const ensureNodeExists = <TNodeData, TNodeMeta extends Record<string, unknown>, TNodeLabel>(
  nodeMap: Map<string, NodeData<TNodeData, TNodeMeta, TNodeLabel>>,
  nodeId: string
): void => {
  const sanitizedNodeId = sanitizeNodeId(nodeId, 'edge-endpoint');
  if (!nodeMap.has(sanitizedNodeId)) {
    nodeMap.set(sanitizedNodeId, { id: sanitizedNodeId } as NodeData<
      TNodeData,
      TNodeMeta,
      TNodeLabel
    >);
  }
};

/**
 * Normalize edge attributes to array format
 */
const normalizeEdgeAttributes = <TEdgeMeta extends Record<string, unknown>, TEdgeLabel>(
  rawAttrs: NxEdgeAttrs<TEdgeMeta, TEdgeLabel> | NxEdgeAttrs<TEdgeMeta, TEdgeLabel>[]
): NxEdgeAttrs<TEdgeMeta, TEdgeLabel>[] => {
  return Array.isArray(rawAttrs) ? rawAttrs : [rawAttrs];
};

/**
 * Generate unique key for undirected edge deduplication
 */
const createUndirectedEdgeKey = (source: string, target: string, index: number): string => {
  return `${[source, target].sort().join('|')}|${index}`;
};

/**
 * Generate default edge ID
 */
const generateEdgeId = (source: string, target: string, index: number): string => {
  return `${source}-${target}-${index}`;
};

/**
 * Check if undirected edge was already processed
 */
const isUndirectedEdgeSeen = (
  edgeType: EdgeType,
  source: string,
  target: string,
  index: number,
  seenSet: Set<string>
): boolean => {
  if (edgeType !== EdgeType.Undirected) return false;

  const key = createUndirectedEdgeKey(source, target, index);
  if (seenSet.has(key)) return true;

  seenSet.add(key);
  return false;
};

/**
 * Create edge data object from attributes
 */
const createEdgeData = (
  source: string,
  target: string,
  index: number,
  attrs: NxEdgeAttrs | undefined,
  defaultEdgeType: EdgeType,
  usedEdgeIds: Set<string>
): EdgeData => {
  const { id, type, points, meta, ...rest } = attrs ?? {};
  const edgeType = (type as EdgeType | undefined) ?? defaultEdgeType;
  const baseId = sanitizeNodeId(String(id ?? generateEdgeId(source, target, index)), 'node');

  return {
    id: ensureUniqueEdgeId(baseId, usedEdgeIds),
    source,
    target,
    type:
      edgeType === EdgeType.Directed || edgeType === EdgeType.Undirected
        ? edgeType
        : defaultEdgeType,
    points: sanitizeEdgePoints(points),
    meta: sanitizeRecord<NonNullable<EdgeData['meta']>>(meta),
    ...rest,
  };
};

const createTypedEdgeData = <TEdgeMeta extends Record<string, unknown>, TEdgeLabel>(
  source: string,
  target: string,
  index: number,
  attrs: NxEdgeAttrs<TEdgeMeta, TEdgeLabel> | undefined,
  defaultEdgeType: EdgeType,
  usedEdgeIds: Set<string>
): GraphEdgeTuple<TEdgeMeta, TEdgeLabel> => {
  const edgeData = createEdgeData(
    source,
    target,
    index,
    attrs as NxEdgeAttrs | undefined,
    defaultEdgeType,
    usedEdgeIds
  );

  return edgeData as GraphEdgeTuple<TEdgeMeta, TEdgeLabel>;
};

/**
 * Process edges from adjacency list for a source node
 */
const processNodeEdges = (
  source: string,
  neighbors: Record<string, NxEdgeAttrs | NxEdgeAttrs[]>,
  defaultEdgeType: 'directed' | 'undirected',
  nodeMap: Map<string, NodeData>,
  undirectedSeen: Set<string>,
  usedEdgeIds: Set<string>
): EdgeData[] => {
  const edges: EdgeData[] = [];

  for (const [target, rawAttrs] of Object.entries(neighbors)) {
    const sanitizedTarget = sanitizeNodeId(target, 'edge-endpoint');
    ensureNodeExists(nodeMap, sanitizedTarget);

    const attrsList = normalizeEdgeAttributes(rawAttrs);

    attrsList.forEach((attrs, idx) => {
      const edgeData = createEdgeData(
        source,
        sanitizedTarget,
        idx,
        attrs,
        defaultEdgeType as EdgeType,
        usedEdgeIds
      );

      // Skip if undirected edge already seen from other direction
      if (!isUndirectedEdgeSeen(edgeData.type!, source, sanitizedTarget, idx, undirectedSeen)) {
        edges.push(edgeData);
      }
    });
  }

  return edges;
};

const processTypedNodeEdges = <
  TNodeData,
  TNodeMeta extends Record<string, unknown>,
  TNodeLabel,
  TEdgeMeta extends Record<string, unknown>,
  TEdgeLabel,
>(
  source: string,
  neighbors: Record<
    string,
    NxEdgeAttrs<TEdgeMeta, TEdgeLabel> | NxEdgeAttrs<TEdgeMeta, TEdgeLabel>[]
  >,
  defaultEdgeType: 'directed' | 'undirected',
  nodeMap: Map<string, GraphNodeTuple<TNodeData, TNodeMeta, TNodeLabel>>,
  undirectedSeen: Set<string>,
  usedEdgeIds: Set<string>
): GraphEdgeTuple<TEdgeMeta, TEdgeLabel>[] => {
  const edges: GraphEdgeTuple<TEdgeMeta, TEdgeLabel>[] = [];

  for (const [target, rawAttrs] of Object.entries(neighbors)) {
    const sanitizedTarget = sanitizeNodeId(target, 'edge-endpoint');
    ensureNodeExists(nodeMap, sanitizedTarget);

    const attrsList = normalizeEdgeAttributes<TEdgeMeta, TEdgeLabel>(rawAttrs);

    attrsList.forEach((attrs, idx) => {
      const edgeData = createTypedEdgeData<TEdgeMeta, TEdgeLabel>(
        source,
        sanitizedTarget,
        idx,
        attrs,
        defaultEdgeType as EdgeType,
        usedEdgeIds
      );

      // Skip if undirected edge already seen from other direction
      if (!isUndirectedEdgeSeen(edgeData.type!, source, sanitizedTarget, idx, undirectedSeen)) {
        edges.push(edgeData);
      }
    });
  }

  return edges;
};

/**
 * Parse NetworkX-style graph input to internal format
 */
export const fromNxGraph = (
  graph: NxGraphInput,
  defaultEdgeType: EdgeType = EdgeType.Undirected
): { nodes: NodeData[]; edges: EdgeData[] } => {
  assertValidGraphInput(graph);

  const nodeMap = buildNodeMap(graph);
  const undirectedSeen = new Set<string>();
  const usedEdgeIds = new Set<string>();
  const edges: EdgeData[] = [];

  for (const [source, neighbors] of Object.entries(graph.adj)) {
    const sanitizedSource = sanitizeNodeId(source, 'edge-endpoint');
    ensureNodeExists(nodeMap, sanitizedSource);

    const nodeEdges = processNodeEdges(
      sanitizedSource,
      neighbors,
      defaultEdgeType,
      nodeMap,
      undirectedSeen,
      usedEdgeIds
    );

    edges.push(...nodeEdges);
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
  };
};

export const fromTypedNxGraph = <
  TNodeData = unknown,
  TNodeMeta extends Record<string, unknown> = Record<string, unknown>,
  TNodeLabel = unknown,
  TEdgeMeta extends Record<string, unknown> = Record<string, unknown>,
  TEdgeLabel = unknown,
>(
  graph: NxGraphInput<TNodeData, TNodeMeta, TNodeLabel, TEdgeMeta, TEdgeLabel>,
  defaultEdgeType: EdgeType = EdgeType.Undirected
): {
  nodes: GraphNodeTuple<TNodeData, TNodeMeta, TNodeLabel>[];
  edges: GraphEdgeTuple<TEdgeMeta, TEdgeLabel>[];
} => {
  assertValidGraphInput(graph as NxGraphInput);

  const nodeMap = buildNodeMap<TNodeData, TNodeMeta, TNodeLabel, TEdgeMeta, TEdgeLabel>(graph);
  const undirectedSeen = new Set<string>();
  const usedEdgeIds = new Set<string>();
  const edges: GraphEdgeTuple<TEdgeMeta, TEdgeLabel>[] = [];

  for (const [source, neighbors] of Object.entries(graph.adj)) {
    const sanitizedSource = sanitizeNodeId(source, 'edge-endpoint');
    ensureNodeExists(nodeMap, sanitizedSource);

    const nodeEdges = processTypedNodeEdges<
      TNodeData,
      TNodeMeta,
      TNodeLabel,
      TEdgeMeta,
      TEdgeLabel
    >(sanitizedSource, neighbors, defaultEdgeType, nodeMap, undirectedSeen, usedEdgeIds);

    edges.push(...nodeEdges);
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
  };
};
