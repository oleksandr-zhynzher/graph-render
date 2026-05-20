import type { Size } from '@graph-render/types';

interface PendingMeasurement {
  readonly element: SVGGElement;
  readonly fallbackWidth: number;
  readonly fallbackHeight: number;
  readonly onMeasure: (size: Size) => void;
}

const measureElement = (
  element: SVGGElement,
  fallbackWidth: number,
  fallbackHeight: number
): Size | null => {
  try {
    if (typeof element.getBBox === 'function') {
      const bounds = element.getBBox();
      if (bounds.width > 0 && bounds.height > 0) {
        return {
          width: Math.ceil(bounds.width),
          height: Math.ceil(bounds.height),
        };
      }
    }
  } catch {
    // fall through to fallback
  }

  if (fallbackWidth > 0 && fallbackHeight > 0) {
    return { width: Math.ceil(fallbackWidth), height: Math.ceil(fallbackHeight) };
  }

  return null;
};

export interface NodeMeasurementScheduler {
  readonly cancel: (nodeId: string) => void;
  readonly cancelAll: () => void;
  readonly schedule: (
    nodeId: string,
    element: SVGGElement,
    fallbackWidth: number,
    fallbackHeight: number,
    onMeasure: (size: Size) => void
  ) => void;
}

export const createNodeMeasurementScheduler = (): NodeMeasurementScheduler => {
  const pendingByNodeId = new Map<string, PendingMeasurement>();
  let frameId: number | null = null;

  const flushMeasurements = () => {
    frameId = null;
    const batch = [...pendingByNodeId.entries()];
    pendingByNodeId.clear();

    for (const [, entry] of batch) {
      const size = measureElement(entry.element, entry.fallbackWidth, entry.fallbackHeight);
      if (size) {
        entry.onMeasure(size);
      }
    }
  };

  const cancel = (nodeId: string): void => {
    pendingByNodeId.delete(nodeId);
    if (pendingByNodeId.size === 0 && frameId != null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  const cancelAll = (): void => {
    pendingByNodeId.clear();
    if (frameId != null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  const schedule: NodeMeasurementScheduler['schedule'] = (
    nodeId,
    element,
    fallbackWidth,
    fallbackHeight,
    onMeasure
  ) => {
    pendingByNodeId.set(nodeId, {
      element,
      fallbackWidth,
      fallbackHeight,
      onMeasure,
    });

    if (frameId == null) {
      frameId = requestAnimationFrame(flushMeasurements);
    }
  };

  return { cancel, cancelAll, schedule };
};
