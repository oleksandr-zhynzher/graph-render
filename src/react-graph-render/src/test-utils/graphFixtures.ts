import type {
  EdgeData,
  NodeData,
  NxGraphInput,
  PositionedEdge,
  PositionedNode,
} from '@graph-render/types';

export const makePositionedNode = (
  id: string,
  overrides: Partial<PositionedNode> = {}
): PositionedNode => ({
  id,
  position: { x: 0, y: 0 },
  size: { width: 100, height: 50 },
  ...overrides,
});

export const makePositionedEdge = (
  id: string,
  source: string,
  target: string,
  overrides: Partial<PositionedEdge> = {}
): PositionedEdge => ({
  id,
  source,
  target,
  points: [],
  ...overrides,
});

export const makeEmptyNxGraph = (): NxGraphInput => ({
  nodes: {},
  adj: {},
});

export const makeNodeData = (id: string, label = id): NodeData => ({ id, label });

export const makeEdgeData = (id: string, source: string, target: string): EdgeData => ({
  id,
  source,
  target,
});
