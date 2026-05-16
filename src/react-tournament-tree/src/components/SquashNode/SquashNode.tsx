import { SquashNodeRenderMode } from '@graph-render/types';
import React from 'react';

import { NODE_DIMENSIONS, NODE_DIMENSIONS_COMPACT } from '../../constants';
import { SquashNodeContent } from './SquashNodeContent';
import { SquashNodeErrorBoundary } from './SquashNodeErrorBoundary';
import type { SquashNodeProps } from './types';

export const SquashNode = React.memo<SquashNodeProps>(function SquashNode({
  node,
  renderMode = SquashNodeRenderMode.Export,
  compact = true,
  onRenderError,
  ...props
}) {
  const width =
    node.size?.width ?? (compact ? NODE_DIMENSIONS_COMPACT.WIDTH : NODE_DIMENSIONS.WIDTH);
  const height =
    node.size?.height ?? (compact ? NODE_DIMENSIONS_COMPACT.HEIGHT : NODE_DIMENSIONS.HEIGHT);

  return (
    <SquashNodeErrorBoundary
      nodeId={node.id}
      renderMode={renderMode}
      width={width}
      height={height}
      onRenderError={onRenderError}
    >
      <SquashNodeContent {...props} node={node} renderMode={renderMode} compact={compact} />
    </SquashNodeErrorBoundary>
  );
});

SquashNode.displayName = 'SquashNode';
