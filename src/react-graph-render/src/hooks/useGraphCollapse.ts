import { useCallback, useMemo, useRef, useState } from 'react';

import type { UseGraphCollapseOptions, UseGraphCollapseResult } from '../models/hookContracts';

export const useGraphCollapse = ({
  collapsedNodeIds,
  defaultCollapsedNodeIds,
  onCollapsedNodeIdsChange,
}: UseGraphCollapseOptions): UseGraphCollapseResult => {
  const [internalCollapsedNodeIds, setInternalCollapsedNodeIds] = useState<readonly string[]>(
    () => defaultCollapsedNodeIds ?? []
  );
  const [pendingExpansionNodeIds, setPendingExpansionNodeIds] = useState<readonly string[]>([]);

  const collapsedIds = collapsedNodeIds ?? internalCollapsedNodeIds;
  const collapsedNodeSet = useMemo(() => new Set(collapsedIds), [collapsedIds]);
  const pendingExpansionNodeSet = useMemo(
    () => new Set(pendingExpansionNodeIds),
    [pendingExpansionNodeIds]
  );

  const collapsedIdsRef = useRef(collapsedIds);
  collapsedIdsRef.current = collapsedIds;

  const updateCollapsedNodeIds = useCallback(
    (next: readonly string[] | ((current: readonly string[]) => readonly string[])) => {
      const resolved = typeof next === 'function' ? next(collapsedIdsRef.current) : next;
      if (collapsedNodeIds == null) {
        setInternalCollapsedNodeIds(resolved);
      }
      onCollapsedNodeIdsChange?.(resolved);
    },
    [collapsedNodeIds, onCollapsedNodeIdsChange]
  );

  return {
    collapsedIds,
    collapsedNodeSet,
    pendingExpansionNodeSet,
    updateCollapsedNodeIds,
    setPendingExpansionNodeIds,
  };
};
