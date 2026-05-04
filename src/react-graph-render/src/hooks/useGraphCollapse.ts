import { useCallback, useMemo, useState } from 'react';

interface UseGraphCollapseOptions {
  collapsedNodeIds?: string[];
  defaultCollapsedNodeIds?: string[];
  onCollapsedNodeIdsChange?: (nodeIds: string[]) => void;
}

interface UseGraphCollapseResult {
  collapsedIds: string[];
  collapsedNodeSet: Set<string>;
  pendingExpansionNodeSet: Set<string>;
  updateCollapsedNodeIds: (next: string[] | ((current: string[]) => string[])) => void;
  setPendingExpansionNodeIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useGraphCollapse = ({
  collapsedNodeIds,
  defaultCollapsedNodeIds,
  onCollapsedNodeIdsChange,
}: UseGraphCollapseOptions): UseGraphCollapseResult => {
  const [internalCollapsedNodeIds, setInternalCollapsedNodeIds] = useState<string[]>(
    defaultCollapsedNodeIds ?? []
  );
  const [pendingExpansionNodeIds, setPendingExpansionNodeIds] = useState<string[]>([]);

  const collapsedIds = collapsedNodeIds ?? internalCollapsedNodeIds;
  const collapsedNodeSet = useMemo(() => new Set(collapsedIds), [collapsedIds]);
  const pendingExpansionNodeSet = useMemo(
    () => new Set(pendingExpansionNodeIds),
    [pendingExpansionNodeIds]
  );

  const updateCollapsedNodeIds = useCallback(
    (next: string[] | ((current: string[]) => string[])) => {
      const current = collapsedIds;
      const resolved = typeof next === 'function' ? next(current) : next;
      if (collapsedNodeIds == null) {
        setInternalCollapsedNodeIds(resolved);
      }
      onCollapsedNodeIdsChange?.(resolved);
    },
    [collapsedIds, collapsedNodeIds, onCollapsedNodeIdsChange]
  );

  return {
    collapsedIds,
    collapsedNodeSet,
    pendingExpansionNodeSet,
    updateCollapsedNodeIds,
    setPendingExpansionNodeIds,
  };
};
