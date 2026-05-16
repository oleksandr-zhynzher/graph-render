import type { SquashNodeRenderMode } from '@graph-render/types';

export const isSvgCompatibleRenderMode = (renderMode: SquashNodeRenderMode): boolean => {
  return renderMode === 'svg' || renderMode === 'export' || renderMode === 'server';
};
