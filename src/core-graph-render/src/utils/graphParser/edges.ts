import { EdgeType } from '@graph-render/types';
import type { GraphInputValidationMode, NodeData, NxEdgeAttrs } from '@graph-render/types';
import { assertNodeExists } from './nodes';
import { sanitizeEdgePoints, sanitizeNodeId, sanitizeRecord } from './sanitizers';
import type { GraphEdgeTuple } from './types';

export const normalizeEdgeAttributes = <TEdgeMeta extends Record<string, unknown>, TEdgeLabel>(
  rawAttrs: NxEdgeAttrs<TEdgeMeta, TEdgeLabel> | NxEdgeAttrs<TEdgeMeta, TEdgeLabel>[]
): NxEdgeAttrs<TEdgeMeta, TEdgeLabel>[] => {
  return Array.isArray(rawAttrs) ? rawAttrs : [rawAttrs];
};

const assertUniqueEdgeId = (candidate: string, usedEdgeIds: Set<string>): string => {
  if (usedEdgeIds.has(candidate)) {
    throw new TypeError(
      `Graph edge identifiers must be unique. Duplicate edge id "${candidate}" was provided.`
    );
  }

  usedEdgeIds.add(candidate);
  return candidate;
};

const createUndirectedEdgeKey = (source: string, target: string, index: number): string => {
  return `${[source, target].sort().join('|')}|${index}`;
};

const generateEdgeId = (source: string, target: string, index: number): string => {
  return `${source}-${target}-${index}`;
};

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

const createEdgeData = <TEdgeMeta extends Record<string, unknown>, TEdgeLabel>(
  source: string,
  target: string,
  index: number,
  attrs: NxEdgeAttrs<TEdgeMeta, TEdgeLabel> | undefined,
  defaultEdgeType: EdgeType,
  usedEdgeIds: Set<string>
): GraphEdgeTuple<TEdgeMeta, TEdgeLabel> => {
  const { id, type, points, meta, ...rest } = attrs ?? {};
  const edgeType = type ?? defaultEdgeType;
  const baseId = sanitizeNodeId(String(id ?? generateEdgeId(source, target, index)), 'node');

  return {
    id: assertUniqueEdgeId(baseId, usedEdgeIds),
    source,
    target,
    type:
      edgeType === EdgeType.Directed || edgeType === EdgeType.Undirected
        ? edgeType
        : defaultEdgeType,
    points: sanitizeEdgePoints(points),
    meta: sanitizeRecord<TEdgeMeta>(meta),
    ...rest,
  };
};

export const processNodeEdges = <
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
  defaultEdgeType: EdgeType,
  inputValidationMode: GraphInputValidationMode,
  nodeMap: Map<string, NodeData<TNodeData, TNodeMeta, TNodeLabel>>,
  undirectedSeen: Set<string>,
  usedEdgeIds: Set<string>
): GraphEdgeTuple<TEdgeMeta, TEdgeLabel>[] => {
  const edges: GraphEdgeTuple<TEdgeMeta, TEdgeLabel>[] = [];

  for (const [target, rawAttrs] of Object.entries(neighbors)) {
    const sanitizedTarget = sanitizeNodeId(target, 'edge-endpoint');
    assertNodeExists(nodeMap, sanitizedTarget, 'target', inputValidationMode);

    normalizeEdgeAttributes(rawAttrs).forEach((attrs, idx) => {
      const edgeData = createEdgeData(
        source,
        sanitizedTarget,
        idx,
        attrs,
        defaultEdgeType,
        usedEdgeIds
      );

      if (
        !isUndirectedEdgeSeen(
          edgeData.type ?? defaultEdgeType,
          source,
          sanitizedTarget,
          idx,
          undirectedSeen
        )
      ) {
        edges.push(edgeData);
      }
    });
  }

  return edges;
};
