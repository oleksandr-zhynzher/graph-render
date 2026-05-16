import { useCallback, useMemo, useRef, useState } from 'react';
import type { UseGraphCollapseOptions, UseGraphCollapseResult } from '../models/hooks';

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

  const collapsedIdsRef = useRef(collapsedIds);
  collapsedIdsRef.current = collapsedIds;

  const updateCollapsedNodeIds = useCallback(
    (next: string[] | ((current: string[]) => string[])) => {
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
