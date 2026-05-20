import { Graph } from '@graph-render/react';
import type { NxGraphInput, VertexComponentProps } from '@graph-render/types';
import { LayoutType, RoutingStyle } from '@graph-render/types';
import type { Meta, StoryObj } from '@storybook/react';

import { graphStoryActionArgs } from '../../graphStoryArgs';

function DarkNode({ node, isSelected, isHovered }: VertexComponentProps) {
  const w = node.size?.width ?? 180;
  const h = node.size?.height ?? 64;
  return (
    <foreignObject width={w} height={h} requiredExtensions="http://www.w3.org/1999/xhtml">
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          padding: '8px 14px',
          borderRadius: 6,
          background: isSelected ? '#1e3a5f' : isHovered ? '#222b3d' : '#161b22',
          color: '#e5ecff',
          border: `1.5px solid ${isSelected ? '#58a6ff' : isHovered ? '#4a6fa5' : '#30363d'}`,
          display: 'flex',
          alignItems: 'center',
          fontWeight: 600,
          fontSize: 13,
          transition: 'all 0.15s',
        }}
      >
        {node.label ?? node.id}
      </div>
    </foreignObject>
  );
}

const graphCrossLayer: NxGraphInput = {
  nodes: {
    src: { label: 'Source' },
    proc1: { label: 'Process A' },
    proc2: { label: 'Process B' },
    proc3: { label: 'Process C' },
    merge: { label: 'Merge' },
    out1: { label: 'Output 1' },
    out2: { label: 'Output 2' },
  },
  adj: {
    src: {
      proc1: { id: 's-p1', type: 'directed' },
      proc2: { id: 's-p2', type: 'directed' },
      proc3: { id: 's-p3', type: 'directed' },
    },
    proc1: {
      merge: { id: 'p1-m', type: 'directed' },
      out1: { id: 'p1-o1', type: 'directed' },
    },
    proc2: {
      merge: { id: 'p2-m', type: 'directed' },
    },
    proc3: {
      merge: { id: 'p3-m', type: 'directed' },
      out2: { id: 'p3-o2', type: 'directed' },
    },
    merge: {
      out1: { id: 'm-o1', type: 'directed' },
      out2: { id: 'm-o2', type: 'directed' },
    },
    out1: {},
    out2: {},
  },
};

const graphDense: NxGraphInput = {
  nodes: Object.fromEntries(
    ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'].map((l, i) => [
      `n${i}`,
      { label: l },
    ])
  ),
  adj: {
    n0: { n1: { id: 'e01' }, n2: { id: 'e02' }, n3: { id: 'e03' } },
    n1: { n4: { id: 'e14' }, n5: { id: 'e15' } },
    n2: { n4: { id: 'e24' }, n6: { id: 'e26' } },
    n3: { n5: { id: 'e35' }, n6: { id: 'e36' } },
    n4: { n7: { id: 'e47' } },
    n5: { n7: { id: 'e57' } },
    n6: { n7: { id: 'e67' } },
    n7: {},
  },
};

const meta: Meta<typeof Graph> = {
  title: 'Graph/Routing',
  component: Graph,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    ...graphStoryActionArgs,
    vertexComponent: DarkNode,
    graph: graphCrossLayer,
    config: {
      width: 960,
      height: 520,
      padding: 40,
      layout: LayoutType.Tree,
      theme: { background: '#0d1117' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Graph>;

export const SmartRouting: Story = {
  name: 'Smart — avoids crossings',
  args: {
    graph: graphCrossLayer,
    config: {
      width: 960,
      height: 520,
      padding: 40,
      layout: LayoutType.Tree,
      routingStyle: RoutingStyle.Smart,
      curveEdges: true,
      curveStrength: 0.35,
      hoverHighlight: true,
      theme: { background: '#0d1117' },
    },
  },
};

export const OrthogonalRouting: Story = {
  name: 'Orthogonal — right-angle paths',
  args: {
    graph: graphCrossLayer,
    config: {
      width: 960,
      height: 520,
      padding: 40,
      layout: LayoutType.Tree,
      routingStyle: RoutingStyle.Orthogonal,
      curveEdges: false,
      hoverHighlight: true,
      theme: { background: '#0d1117' },
    },
  },
};

export const BundledRouting: Story = {
  name: 'Bundled — grouped parallel edges',
  args: {
    graph: graphDense,
    config: {
      width: 960,
      height: 520,
      padding: 40,
      layout: LayoutType.Tree,
      routingStyle: RoutingStyle.Bundled,
      curveEdges: true,
      curveStrength: 0.5,
      edgeSeparation: 8,
      hoverHighlight: true,
      theme: { background: '#0d1117' },
    },
  },
};

export const CurvedSmooth: Story = {
  name: 'Curved — smooth bezier splines',
  args: {
    graph: graphDense,
    config: {
      width: 960,
      height: 520,
      padding: 40,
      layout: LayoutType.Tree,
      routingStyle: RoutingStyle.Smart,
      curveEdges: true,
      curveStrength: 0.55,
      hoverHighlight: true,
      theme: { background: '#060b12', edgeColor: '#1f3855' },
    },
  },
};

export const StraightEdges: Story = {
  name: 'Straight — minimal style',
  args: {
    graph: graphDense,
    config: {
      width: 960,
      height: 520,
      padding: 40,
      layout: LayoutType.Tree,
      curveEdges: false,
      hoverHighlight: true,
      theme: { background: '#0d1117' },
    },
  },
};
