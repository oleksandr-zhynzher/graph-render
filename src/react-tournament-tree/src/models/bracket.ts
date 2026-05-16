import type { GraphHandle, StageView } from '@graph-render/types';

export interface UseStageNavigationParams {
  readonly defaultNavigationMode: boolean;
  readonly graphRef: React.RefObject<GraphHandle | null>;
  readonly contentViewportRef: React.RefObject<HTMLDivElement | null>;
  readonly graphWidth?: number | undefined;
  readonly graphHeight?: number | undefined;
  readonly stageViews: readonly StageView[];
  readonly setStageViews: React.Dispatch<React.SetStateAction<readonly StageView[]>>;
}
