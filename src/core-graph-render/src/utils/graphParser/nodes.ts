import { GraphInputValidationMode, type NodeData, type NxGraphInput } from '@graph-render/types';

import { isPlainObject } from './guards';
import { sanitizeNodeData, sanitizeNodeId } from './sanitizers';
import type { GraphNodeTuple } from './types';

export const buildNodeMap = <TNodeData, TNodeMeta extends Record<string, unknown>, TNodeLabel>(
  graph: NxGraphInput<TNodeData, TNodeMeta, TNodeLabel>
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

const ensureNodeExists = <TNodeData, TNodeMeta extends Record<string, unknown>, TNodeLabel>(
  nodeMap: Map<string, NodeData<TNodeData, TNodeMeta, TNodeLabel>>,
  nodeId: string
): void => {
  const sanitizedNodeId = sanitizeNodeId(nodeId, 'edge-endpoint');
  if (!nodeMap.has(sanitizedNodeId)) {
    nodeMap.set(sanitizedNodeId, { id: sanitizedNodeId });
  }
};

export const assertNodeExists = <TNodeData, TNodeMeta extends Record<string, unknown>, TNodeLabel>(
  nodeMap: Map<string, NodeData<TNodeData, TNodeMeta, TNodeLabel>>,
  nodeId: string,
  kind: 'source' | 'target',
  inputValidationMode: GraphInputValidationMode
): void => {
  const sanitizedNodeId = sanitizeNodeId(nodeId, 'edge-endpoint');

  if (inputValidationMode === GraphInputValidationMode.Implicit) {
    ensureNodeExists(nodeMap, sanitizedNodeId);
    return;
  }

  if (!nodeMap.has(sanitizedNodeId)) {
    throw new TypeError(
      `Graph edge ${kind} "${sanitizedNodeId}" must exist in graph.nodes when explicit node definitions are provided.`
    );
  }
};
