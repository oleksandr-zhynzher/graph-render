import { useMemo } from 'react';
import type { VertexComponentProps } from '@graph-render/types';
import type { TournamentBracketProps } from '@graph-render/types';
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
        <SquashNode {...props} renderMode="export" onRenderError={onInvalidNode} />
      )),
    [onInvalidNode, vertexComponent]
  );
  const resolvedVertexComponent = useMemo(
    () =>
      vertexComponent ??
      ((props: VertexComponentProps) => (
        <SquashNode
          {...props}
          renderMode={nodeRenderMode ?? 'export'}
          compact={compact}
          onRenderError={onInvalidNode}
        />
      )),
    [compact, nodeRenderMode, onInvalidNode, vertexComponent]
  );

  return { exportVertexComponent, resolvedVertexComponent };
}
