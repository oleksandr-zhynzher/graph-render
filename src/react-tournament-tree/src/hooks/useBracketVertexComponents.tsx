import type { TournamentBracketProps, VertexComponentProps } from '@graph-render/types';
import { SquashNodeRenderMode } from '@graph-render/types';
import { useMemo } from 'react';

import { SquashNode } from '../components/SquashNode';

export function useBracketVertexComponents({
  compact,
  nodeRenderMode,
  onInvalidNode,
  vertexComponent,
}: Pick<
  TournamentBracketProps,
  'compact' | 'nodeRenderMode' | 'onInvalidNode' | 'vertexComponent'
>) {
  const exportVertexComponent = useMemo(
    () =>
      vertexComponent ??
      ((props: VertexComponentProps) => (
        <SquashNode
          {...props}
          renderMode={SquashNodeRenderMode.Export}
          onRenderError={onInvalidNode}
        />
      )),
    [onInvalidNode, vertexComponent]
  );
  const resolvedVertexComponent = useMemo(
    () =>
      vertexComponent ??
      ((props: VertexComponentProps) => (
        <SquashNode
          {...props}
          renderMode={nodeRenderMode ?? SquashNodeRenderMode.Export}
          compact={compact}
          onRenderError={onInvalidNode}
        />
      )),
    [compact, nodeRenderMode, onInvalidNode, vertexComponent]
  );

  return { exportVertexComponent, resolvedVertexComponent };
}
