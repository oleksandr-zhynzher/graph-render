import { type LayoutOptions, LayoutType, type PositionedNode } from '@graph-render/types';

import { layoutNodes } from '../layouts';

export const buildFallbackLayout = (layoutOptions: LayoutOptions): readonly PositionedNode[] => {
  return layoutNodes({
    ...layoutOptions,
    layout: LayoutType.Centered,
  });
};
