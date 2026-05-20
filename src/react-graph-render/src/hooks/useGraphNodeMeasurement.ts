import type { PositionedNode, Size } from '@graph-render/types';
import { useEffect, useRef } from 'react';

import type { NodeMeasurementScheduler } from '../utils/nodeMeasurementScheduler';

interface UseGraphNodeMeasurementOptions {
  readonly node: PositionedNode;
  readonly width: number;
  readonly height: number;
  readonly measurementScheduler: NodeMeasurementScheduler;
  readonly onNodeMeasure?: ((nodeId: string, size: Size) => void) | undefined;
}

export const useGraphNodeMeasurement = ({
  node,
  width,
  height,
  measurementScheduler,
  onNodeMeasure,
}: UseGraphNodeMeasurementOptions) => {
  const groupRef = useRef<SVGGElement>(null);
  const lastReportedRef = useRef<{ nodeId: string; width: number; height: number } | null>(null);
  const onNodeMeasureRef = useRef(onNodeMeasure);
  onNodeMeasureRef.current = onNodeMeasure;

  useEffect(() => {
    const element = groupRef.current;
    const measure = onNodeMeasureRef.current;
    if (!element || !measure) {
      return;
    }

    measurementScheduler.schedule(node.id, element, width, height, (size) => {
      const lastReported = lastReportedRef.current;
      if (
        lastReported?.nodeId === node.id &&
        lastReported.width === size.width &&
        lastReported.height === size.height
      ) {
        return;
      }
      lastReportedRef.current = { nodeId: node.id, ...size };
      measure(node.id, size);
    });

    return () => {
      measurementScheduler.cancel(node.id);
    };
  }, [height, measurementScheduler, node.id, node.label, width]);

  return groupRef;
};
