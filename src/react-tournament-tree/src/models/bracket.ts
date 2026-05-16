import type { GraphHandle, StageView } from '@graph-render/types';

export type UseStageNavigationParams = {
  defaultNavigationMode: boolean;
  graphRef: React.RefObject<GraphHandle | null>;
  contentViewportRef: React.RefObject<HTMLDivElement | null>;
  graphWidth?: number;
  graphHeight?: number;
  stageViews: StageView[];
  setStageViews: React.Dispatch<React.SetStateAction<StageView[]>>;
};
