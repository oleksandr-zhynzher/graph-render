import { useEffect, useLayoutEffect, useRef } from 'react';
import type { PositionedNode, Size } from '@graph-render/types';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

interface UseGraphNodeMeasurementOptions {
  node: PositionedNode;
  width: number;
  height: number;
  onNodeMeasure?: (nodeId: string, size: Size) => void;
}

export const useGraphNodeMeasurement = ({
  node,
  width,
  height,
  onNodeMeasure,
}: UseGraphNodeMeasurementOptions) => {
  const groupRef = useRef<SVGGElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!groupRef.current || !onNodeMeasure) {
      return;
    }

    const reportFallbackSize = () => {
      if (width > 0 && height > 0) {
        onNodeMeasure(node.id, { width: Math.ceil(width), height: Math.ceil(height) });
      }
    };

    const frame = requestAnimationFrame(() => {
      try {
        if (typeof groupRef.current?.getBBox !== 'function') {
          reportFallbackSize();
          return;
        }

        const bounds = groupRef.current?.getBBox();
        if (bounds && bounds.width > 0 && bounds.height > 0) {
          onNodeMeasure(node.id, {
            width: Math.ceil(bounds.width),
            height: Math.ceil(bounds.height),
          });
          return;
        }
      } catch {
        reportFallbackSize();
      }

      reportFallbackSize();
    });

    return () => cancelAnimationFrame(frame);
  }, [node.id, node.label, node.meta, onNodeMeasure, width, height]);

  return groupRef;
};
