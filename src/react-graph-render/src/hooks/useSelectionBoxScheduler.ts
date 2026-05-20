import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef } from 'react';

import type { SelectionBox } from '../utils/pointer';

export const useSelectionBoxScheduler = (
  setSelectionBox: Dispatch<SetStateAction<SelectionBox | null>>
) => {
  const selectionBoxFrameRef = useRef<number | null>(null);
  const pendingSelectionBoxRef = useRef<SelectionBox | null>(null);

  const cancelSelectionBoxUpdate = useCallback(() => {
    if (selectionBoxFrameRef.current != null) {
      cancelAnimationFrame(selectionBoxFrameRef.current);
      selectionBoxFrameRef.current = null;
    }
    pendingSelectionBoxRef.current = null;
  }, []);

  const scheduleSelectionBoxUpdate = useCallback(
    (next: SelectionBox) => {
      pendingSelectionBoxRef.current = next;
      if (selectionBoxFrameRef.current == null) {
        selectionBoxFrameRef.current = requestAnimationFrame(() => {
          selectionBoxFrameRef.current = null;
          const pending = pendingSelectionBoxRef.current;
          if (pending) {
            setSelectionBox(pending);
          }
        });
      }
    },
    [setSelectionBox]
  );

  useEffect(() => cancelSelectionBoxUpdate, [cancelSelectionBoxUpdate]);

  return {
    cancelSelectionBoxUpdate,
    pendingSelectionBoxRef,
    scheduleSelectionBoxUpdate,
    selectionBoxFrameRef,
  };
};
