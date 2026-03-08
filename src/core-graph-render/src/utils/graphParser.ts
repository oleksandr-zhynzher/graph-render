import { NxGraphInput, NodeData, EdgeData, NxEdgeAttrs, EdgeType } from '@graph-render/types';

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
const buildNodeMap = (graph: NxGraphInput): Map<string, NodeData> => {
  const nodeMap = new Map<NodeData['id'], NodeData>();

  if (graph.nodes) {
    for (const [id, attrs] of Object.entries(graph.nodes)) {
      nodeMap.set(id, { id, ...attrs });
    }
  }

  return nodeMap;
};

/**
 * Ensure a node exists in the map, creating it if necessary
 */
const ensureNodeExists = (nodeMap: Map<string, NodeData>, nodeId: string): void => {
  if (!nodeMap.has(nodeId)) {
    nodeMap.set(nodeId, { id: nodeId });
  }
};

/**
 * Normalize edge attributes to array format
 */
const normalizeEdgeAttributes = (rawAttrs: NxEdgeAttrs | NxEdgeAttrs[]): NxEdgeAttrs[] => {
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
  defaultEdgeType: EdgeType
): EdgeData => {
  const { id, type, ...rest } = attrs ?? {};
  const edgeType = (type as EdgeType | undefined) ?? defaultEdgeType;

  return {
    id: id ?? generateEdgeId(source, target, index),
    source,
    target,
    type: edgeType,
    ...rest,
  };
};

/**
 * Process edges from adjacency list for a source node
 */
const processNodeEdges = (
  source: string,
  neighbors: Record<string, NxEdgeAttrs | NxEdgeAttrs[]>,
  defaultEdgeType: 'directed' | 'undirected',
  nodeMap: Map<string, NodeData>,
  undirectedSeen: Set<string>
): EdgeData[] => {
  const edges: EdgeData[] = [];

  for (const [target, rawAttrs] of Object.entries(neighbors)) {
    ensureNodeExists(nodeMap, target);

    const attrsList = normalizeEdgeAttributes(rawAttrs);

    attrsList.forEach((attrs, idx) => {
      const edgeData = createEdgeData(source, target, idx, attrs, defaultEdgeType as EdgeType);

      // Skip if undirected edge already seen from other direction
      if (!isUndirectedEdgeSeen(edgeData.type!, source, target, idx, undirectedSeen)) {
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
  const edges: EdgeData[] = [];

  for (const [source, neighbors] of Object.entries(graph.adj)) {
    ensureNodeExists(nodeMap, source);

    const nodeEdges = processNodeEdges(source, neighbors, defaultEdgeType, nodeMap, undirectedSeen);

    edges.push(...nodeEdges);
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
  };
};
