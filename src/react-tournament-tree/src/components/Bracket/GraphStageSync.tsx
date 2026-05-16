import { useEffect, useMemo } from 'react';
import type { GraphRenderContext, StageView } from '@graph-render/types';
import { buildStageViews } from '../../utils/stageViews';

type GraphStageSyncProps = {
  context: GraphRenderContext;
  labels: string[];
  labelOffset: number;
  onStagesChange: (stages: StageView[]) => void;
};

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
