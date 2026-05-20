import type {
  EdgeData,
  NodeData,
  NxGraphInput,
  PositionedEdge,
  PositionedNode,
} from '@graph-render/types';
import type { GraphHandle, GraphProps } from '@graph-render/types/react';
import { GraphErrorPhase } from '@graph-render/types/react';
import React, { useCallback, useRef } from 'react';

import { useGraphController } from '../hooks/useGraphController';
import { useStableConfig } from '../hooks/useStableConfig';
import { GraphCanvas } from './GraphCanvas';
import { GraphErrorBoundary } from './GraphErrorBoundary';

function GraphInner(props: GraphProps, ref: React.ForwardedRef<GraphHandle>) {
  const canvasProps = useGraphController(props, ref);
  return <GraphCanvas {...canvasProps} />;
}

type GraphComponent = <
  TGraph extends NxGraphInput = NxGraphInput,
  TNode extends PositionedNode = PositionedNode,
  TEdge extends PositionedEdge = PositionedEdge,
  TNodeRecord extends NodeData = NodeData,
  TEdgeRecord extends EdgeData = EdgeData,
>(
  props: GraphProps<TGraph, TNode, TEdge, TNodeRecord, TEdgeRecord> &
    React.RefAttributes<GraphHandle>
) => React.ReactElement | null;

const GraphBase = React.memo(React.forwardRef<GraphHandle, GraphProps>(GraphInner));

GraphBase.displayName = 'Graph';

const GraphWithBoundary = React.forwardRef<GraphHandle, GraphProps>(
  function GraphWithBoundary(props, ref) {
    const reportedErrorsRef = useRef<WeakSet<Error>>(new WeakSet());
    const onErrorRef = useRef(props.onError);
    const stableResetConfig = useStableConfig(props.config);
    onErrorRef.current = props.onError;
    const reportError = useCallback<NonNullable<GraphProps['onError']>>((error, context) => {
      if (reportedErrorsRef.current.has(error)) {
        return;
      }

      reportedErrorsRef.current.add(error);
      onErrorRef.current?.(error, context);
    }, []);

    return (
      <GraphErrorBoundary
        resetKeys={[props.graph, stableResetConfig, props.vertexComponent, props.edgeComponent]}
        onError={
          props.onError
            ? (error) => {
                reportError(error, { graph: props.graph, phase: GraphErrorPhase.Render });
              }
            : undefined
        }
      >
        <GraphBase ref={ref} {...props} onError={props.onError ? reportError : undefined} />
      </GraphErrorBoundary>
    );
  }
);

GraphWithBoundary.displayName = 'Graph';

export const Graph = GraphWithBoundary as GraphComponent;

export default Graph;
