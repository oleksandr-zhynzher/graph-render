import { SquashNodeRenderMode } from '@graph-render/types';

export const isSvgCompatibleRenderMode = (renderMode: SquashNodeRenderMode): boolean => {
  return (
    renderMode === SquashNodeRenderMode.Svg ||
    renderMode === SquashNodeRenderMode.Export ||
    renderMode === SquashNodeRenderMode.Server
  );
};
