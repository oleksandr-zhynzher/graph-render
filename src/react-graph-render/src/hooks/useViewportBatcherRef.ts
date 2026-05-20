import type { GraphHandle } from '@graph-render/types/react';
import { useEffect, useRef } from 'react';

import { createViewportBatcher } from '../utils/viewportBatch';

export const useViewportBatcherRef = (updateViewport: GraphHandle['setViewport']) => {
  const viewportBatcherRef = useRef(createViewportBatcher(updateViewport));

  useEffect(() => {
    const previousBatcher = viewportBatcherRef.current;
    const nextBatcher = createViewportBatcher(updateViewport);
    previousBatcher.cancel();
    viewportBatcherRef.current = nextBatcher;

    return () => {
      nextBatcher.cancel();
    };
  }, [updateViewport]);

  return viewportBatcherRef;
};
