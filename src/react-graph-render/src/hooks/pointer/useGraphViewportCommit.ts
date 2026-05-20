import type { GraphViewport } from '@graph-render/types/react';
import { useCallback } from 'react';

import type { UseGraphPointerInteractionsOptions } from '../../models/hookContracts';
import { useViewportBatcherRef } from '../useViewportBatcherRef';

export const useGraphViewportCommit = ({
  updateViewport,
  viewportRef,
}: Pick<UseGraphPointerInteractionsOptions, 'updateViewport' | 'viewportRef'>) => {
  const viewportBatcherRef = useViewportBatcherRef(updateViewport);

  const commitViewport = useCallback(
    (
      next:
        | Partial<GraphViewport>
        | GraphViewport
        | ((current: GraphViewport) => Partial<GraphViewport> | GraphViewport)
    ) => {
      viewportBatcherRef.current.schedule(next, () => viewportRef.current);
    },
    [viewportBatcherRef, viewportRef]
  );

  const flushViewport = useCallback(() => {
    viewportBatcherRef.current.flushNow();
  }, [viewportBatcherRef]);

  const cancelViewport = useCallback(() => {
    viewportBatcherRef.current.cancel();
  }, [viewportBatcherRef]);

  return { cancelViewport, commitViewport, flushViewport, viewportBatcherRef };
};
