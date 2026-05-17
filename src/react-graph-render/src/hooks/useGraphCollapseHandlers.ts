import type { PositionedNode } from '@graph-render/types';
import { GraphErrorPhase } from '@graph-render/types';
import { useCallback } from 'react';

import type { UseGraphCollapseHandlersOptions } from '../models/hooks';

const toError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error(String(error));
};

export const useGraphCollapseHandlers = ({
  childNodeIdsByParent,
  collapsedNodeSet,
  graph,
  onError,
  onNodeCollapse,
  onNodeExpand,
  pendingExpansionNodeSet,
  setPendingExpansionNodeIds,
  toggleCollapseOnNodeDoubleClick,
  updateCollapsedNodeIds,
}: UseGraphCollapseHandlersOptions) => {
  return useCallback(
    (node: PositionedNode) => {
      if (!toggleCollapseOnNodeDoubleClick) return;

      const hasChildren = (childNodeIdsByParent.get(node.id) ?? []).length > 0;
      if (!hasChildren || pendingExpansionNodeSet.has(node.id)) return;

      if (!collapsedNodeSet.has(node.id)) {
        updateCollapsedNodeIds((current) => [...current, node.id]);
        try {
          onNodeCollapse?.(node.id);
        } catch (error) {
          onError?.(toError(error), { graph, phase: GraphErrorPhase.Interaction });
        }
        return;
      }

      try {
        const expandResult = onNodeExpand?.(node.id);
        if (expandResult && typeof expandResult === 'object' && 'then' in expandResult) {
          setPendingExpansionNodeIds((current) =>
            current.includes(node.id) ? current : [...current, node.id]
          );
          void Promise.resolve(expandResult)
            .then(() => updateCollapsedNodeIds((current) => current.filter((id) => id !== node.id)))
            .catch((error: unknown) =>
              onError?.(toError(error), { graph, phase: GraphErrorPhase.Interaction })
            )
            .finally(() => {
              setPendingExpansionNodeIds((current) =>
                current.filter((pendingNodeId) => pendingNodeId !== node.id)
              );
            });
          return;
        }

        updateCollapsedNodeIds((current) => current.filter((id) => id !== node.id));
      } catch (error) {
        onError?.(toError(error), { graph, phase: GraphErrorPhase.Interaction });
      }
    },
    [
      childNodeIdsByParent,
      collapsedNodeSet,
      graph,
      onError,
      onNodeCollapse,
      onNodeExpand,
      pendingExpansionNodeSet,
      setPendingExpansionNodeIds,
      toggleCollapseOnNodeDoubleClick,
      updateCollapsedNodeIds,
    ]
  );
};
