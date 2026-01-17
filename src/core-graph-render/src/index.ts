// Export all types
export * from '@graph-render/types';

// Export main rendering function
export { renderGraphToSvg } from './rendering/svg';

// Export layout functions
export { layoutNodes, gridLayout, centeredLayout, treeLayout } from './layouts';

// Export edge utilities
export { routeEdges } from './edges/routing';
export { buildEdgePath } from './edges/pathBuilder';
export { segmentIntersectsRect } from './edges/collision';

// Export utilities
export { fromNxGraph } from './utils/graphParser';
export {
  DEFAULT_THEME,
  DEFAULT_NODE_SIZE,
  DEFAULT_NODE_GAP,
  DEFAULT_PADDING,
} from './utils/constants';
export {
  groupEdgesByTarget,
  sortEdgesBySourcePosition,
  traverseGraphPath,
  extractPlayerNamesFromNodes,
} from './utils/graphTraversal';

// Export rendering utilities
export { defaultNodeRenderer, defaultEdgeRenderer } from './rendering/defaultRenderers';
export { escapeXml } from './rendering/utils';
