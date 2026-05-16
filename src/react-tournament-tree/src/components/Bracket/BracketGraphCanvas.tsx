import { useCallback } from 'react';
import { Graph } from '@graph-render/react';
import type {
  GraphConfig,
  GraphHandle,
  PositionedNode,
  SquashPositionedNode,
  StageView,
  TournamentBracketProps,
} from '@graph-render/types';
import { routeBracketEdges } from '../../utils/bracketRouting';
import { GraphStageSync } from './GraphStageSync';

type BracketGraphCanvasProps = {
  graphRef: React.RefObject<GraphHandle | null>;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  graph: TournamentBracketProps['graph'];
  vertexComponent: NonNullable<TournamentBracketProps['vertexComponent']>;
  config: GraphConfig;
  defaultViewport: TournamentBracketProps['defaultViewport'];
  isNavigationMode: boolean;
  translateExtent: [[number, number], [number, number]] | undefined;
  showViewportControls: boolean;
  panEnabled: TournamentBracketProps['panEnabled'];
  zoomEnabled: TournamentBracketProps['zoomEnabled'];
  pinchZoomEnabled: TournamentBracketProps['pinchZoomEnabled'];
  labels: string[];
  onStagesChange: (stages: StageView[]) => void;
  onMatchClick: TournamentBracketProps['onMatchClick'];
};

export function BracketGraphCanvas({
  graphRef,
  wrapperRef,
  graph,
  vertexComponent,
  config,
  defaultViewport,
  isNavigationMode,
  translateExtent,
  showViewportControls,
  panEnabled,
  zoomEnabled,
  pinchZoomEnabled,
  labels,
  onStagesChange,
  onMatchClick,
}: BracketGraphCanvasProps) {
  const handleMatchClick = useCallback(
    (node: PositionedNode) => {
      onMatchClick?.(node as SquashPositionedNode);
    },
    [onMatchClick]
  );

  return (
    <div ref={wrapperRef} style={{ minWidth: 'fit-content' }}>
      <Graph
        ref={graphRef}
        graph={graph}
        vertexComponent={vertexComponent}
        config={config}
        defaultViewport={defaultViewport}
        panEnabled={panEnabled ?? !isNavigationMode}
        zoomEnabled={zoomEnabled ?? !isNavigationMode}
        pinchZoomEnabled={pinchZoomEnabled ?? !isNavigationMode}
        translateExtent={isNavigationMode ? undefined : translateExtent}
        showControls={showViewportControls}
        onNodeClick={handleMatchClick}
        routeEdgesOverride={routeBracketEdges}
        renderOverlay={(context) => (
          <GraphStageSync
            context={context}
            labels={labels}
            labelOffset={config.labelOffset ?? 46}
            onStagesChange={onStagesChange}
          />
        )}
      />
    </div>
  );
}
