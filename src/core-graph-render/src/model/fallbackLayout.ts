import { LayoutType, type LayoutOptions, type PositionedNode } from '@graph-render/types';
import { layoutNodes } from '../layouts';

export const buildFallbackLayout = (layoutOptions: LayoutOptions): PositionedNode[] => {
  return layoutNodes({
    ...layoutOptions,
    layout: LayoutType.Centered,
  });
};
