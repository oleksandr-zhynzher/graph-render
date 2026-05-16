import type { GraphRenderContext, StageView } from '@graph-render/types';
import { useEffect, useMemo } from 'react';

import { buildStageViews } from '../../utils/stageViews';

interface GraphStageSyncProps {
  readonly context: GraphRenderContext;
  readonly labels: readonly string[];
  readonly labelOffset: number;
  readonly onStagesChange: (stages: readonly StageView[]) => void;
}

export function GraphStageSync({
  context,
  labels,
  labelOffset,
  onStagesChange,
}: GraphStageSyncProps) {
  const stages = useMemo(
    () => buildStageViews(context.nodes, labels, labelOffset),
    [context.nodes, labelOffset, labels]
  );

  useEffect(() => {
    onStagesChange(stages);
  }, [onStagesChange, stages]);

  return null;
}
