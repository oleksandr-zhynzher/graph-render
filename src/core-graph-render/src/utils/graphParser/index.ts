import {
  EdgeData,
  EdgeType,
  GraphParserOptions,
  NodeData,
  NxGraphInput,
} from '@graph-render/types';
import { processNodeEdges } from './edges';
import { assertNodeExists, buildNodeMap } from './nodes';
import { sanitizeNodeId } from './sanitizers';
import type { GraphEdgeTuple, GraphNodeTuple } from './types';
import { assertValidGraphInput, resolveInputValidationMode } from './validation';

export const fromNxGraph = (
  graph: NxGraphInput,
  defaultEdgeType: EdgeType = EdgeType.Undirected,
  options?: GraphParserOptions
): { nodes: NodeData[]; edges: EdgeData[] } => {
  assertValidGraphInput(graph);

  const nodeMap = buildNodeMap(graph);
  const inputValidationMode = resolveInputValidationMode(graph, options);
  const undirectedSeen = new Set<string>();
  const usedEdgeIds = new Set<string>();
  const edges: EdgeData[] = [];

  for (const [source, neighbors] of Object.entries(graph.adj)) {
    const sanitizedSource = sanitizeNodeId(source, 'edge-endpoint');
    assertNodeExists(nodeMap, sanitizedSource, 'source', inputValidationMode);

    edges.push(
      ...processNodeEdges(
        sanitizedSource,
        neighbors,
        defaultEdgeType,
        inputValidationMode,
        nodeMap,
        undirectedSeen,
        usedEdgeIds
      )
    );
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
  defaultEdgeType: EdgeType = EdgeType.Undirected,
  options?: GraphParserOptions
): {
  nodes: GraphNodeTuple<TNodeData, TNodeMeta, TNodeLabel>[];
  edges: GraphEdgeTuple<TEdgeMeta, TEdgeLabel>[];
} => {
  assertValidGraphInput(graph as NxGraphInput);

  const nodeMap = buildNodeMap<TNodeData, TNodeMeta, TNodeLabel>(graph);
  const inputValidationMode = resolveInputValidationMode(graph as NxGraphInput, options);
  const undirectedSeen = new Set<string>();
  const usedEdgeIds = new Set<string>();
  const edges: GraphEdgeTuple<TEdgeMeta, TEdgeLabel>[] = [];

  for (const [source, neighbors] of Object.entries(graph.adj)) {
    const sanitizedSource = sanitizeNodeId(source, 'edge-endpoint');
    assertNodeExists(nodeMap, sanitizedSource, 'source', inputValidationMode);

    edges.push(
      ...processNodeEdges(
        sanitizedSource,
        neighbors,
        defaultEdgeType,
        inputValidationMode,
        nodeMap,
        undirectedSeen,
        usedEdgeIds
      )
    );
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
  };
};
