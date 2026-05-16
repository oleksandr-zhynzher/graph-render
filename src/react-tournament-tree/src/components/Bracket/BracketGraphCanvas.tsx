import { Graph } from '@graph-render/react';
import type {
  GraphConfig,
  GraphHandle,
  PositionedNode,
  SquashPositionedNode,
  StageView,
  TournamentBracketProps,
} from '@graph-render/types';
import { useCallback } from 'react';

import { routeBracketEdges } from '../../utils/bracketRouting';
import { GraphStageSync } from './GraphStageSync';

interface BracketGraphCanvasProps {
  readonly graphRef: React.RefObject<GraphHandle | null>;
  readonly wrapperRef: React.RefObject<HTMLDivElement | null>;
  readonly graph: TournamentBracketProps['graph'];
  readonly vertexComponent: NonNullable<TournamentBracketProps['vertexComponent']>;
  readonly config: GraphConfig;
  readonly defaultViewport: TournamentBracketProps['defaultViewport'];
  readonly isNavigationMode: boolean;
  readonly translateExtent:
    | readonly [readonly [number, number], readonly [number, number]]
    | undefined;
  readonly showViewportControls: boolean;
  readonly panEnabled: TournamentBracketProps['panEnabled'];
  readonly zoomEnabled: TournamentBracketProps['zoomEnabled'];
  readonly pinchZoomEnabled: TournamentBracketProps['pinchZoomEnabled'];
  readonly labels: readonly string[];
  readonly onStagesChange: (stages: readonly StageView[]) => void;
  readonly onMatchClick: TournamentBracketProps['onMatchClick'];
}

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
