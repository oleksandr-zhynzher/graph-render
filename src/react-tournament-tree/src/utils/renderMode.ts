import { SquashNodeRenderMode } from '@graph-render/types/tournament';

export const isSvgCompatibleRenderMode = (renderMode: SquashNodeRenderMode): boolean => {
  return (
    renderMode === SquashNodeRenderMode.Svg ||
    renderMode === SquashNodeRenderMode.Export ||
    renderMode === SquashNodeRenderMode.Server
  );
};
