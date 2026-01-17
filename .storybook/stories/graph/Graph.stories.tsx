import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Graph } from '@graph-render/react';
import type { NxGraphInput, VertexComponentProps } from '@graph-render/react';

const DemoNode = ({ node }: VertexComponentProps) => (
  <foreignObject
    width={node.size?.width ?? 180}
    height={node.size?.height ?? 72}
    requiredExtensions="http://www.w3.org/1999/xhtml"
  >
    <div
      style={{
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        padding: 12,
        borderRadius: 8,
        background: '#1b1f2a',
        color: '#e5ecff',
        border: '1px solid #324569',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        justifyContent: 'center',
      }}
    >
      <strong style={{ fontSize: 14 }}>{node.label ?? node.id}</strong>
      <small style={{ opacity: 0.8 }}>({node.id})</small>
    </div>
  </foreignObject>
);

const graphSimple: NxGraphInput = {
  nodes: {
    a: { label: 'Root' },
    b: { label: 'Child 1' },
    c: { label: 'Child 2' },
  },
  adj: {
    a: {
      b: { id: 'a-b', type: 'directed' },
      c: { id: 'a-c', type: 'directed' },
    },
    b: {},
    c: {},
  },
};

const graphTwenty: NxGraphInput = {
  nodes: {
    n1: { label: 'Hub' },
    n2: { label: 'Branch A' },
    n3: { label: 'Branch B' },
    n4: { label: 'Branch C' },
    n5: { label: 'Branch D' },
    n6: { label: 'Leaf A1' },
    n7: { label: 'Leaf A2' },
    n8: { label: 'Leaf B1' },
    n9: { label: 'Leaf B2' },
    n10: { label: 'Leaf C1' },
    n11: { label: 'Leaf D1' },
    n12: { label: 'Depth A1' },
    n13: { label: 'Depth A2' },
    n14: { label: 'Depth B1' },
    n15: { label: 'Depth B2' },
    n16: { label: 'Depth C1' },
    n17: { label: 'Depth D1' },
    n18: { label: 'Tail A1' },
    n19: { label: 'Tail A2' },
    n20: { label: 'Tail B1' },
  },
  adj: {
    n1: {
      n2: { id: 'e1', type: 'directed' },
      n3: { id: 'e2', type: 'directed' },
      n4: { id: 'e3', type: 'directed' },
      n5: { id: 'e4', type: 'directed' },
    },
    n2: {
      n6: { id: 'e5', type: 'directed' },
      n7: { id: 'e6', type: 'directed' },
    },
    n3: {
      n8: { id: 'e7', type: 'directed' },
      n9: { id: 'e8', type: 'directed' },
      n11: { id: 'e22', type: 'directed' },
    },
    n4: { n10: { id: 'e9', type: 'directed' } },
    n5: {
      n11: { id: 'e10', type: 'directed' },
      n9: { id: 'e20', type: 'directed' },
    },
    n6: { n12: { id: 'e11', type: 'directed' } },
    n7: {
      n13: { id: 'e12', type: 'directed' },
      n10: { id: 'e21', type: 'directed' },
    },
    n8: { n14: { id: 'e13', type: 'directed' } },
    n9: { n15: { id: 'e14', type: 'directed' } },
    n10: { n16: { id: 'e15', type: 'directed' } },
    n11: { n17: { id: 'e16', type: 'directed' } },
    n12: { n18: { id: 'e17', type: 'directed' } },
    n13: { n19: { id: 'e18', type: 'directed' } },
    n14: { n20: { id: 'e19', type: 'directed' } },
  },
};

const graphUndirected: NxGraphInput = {
  nodes: {
    u1: { label: 'Alpha' },
    u2: { label: 'Beta' },
    u3: { label: 'Gamma' },
  },
  adj: {
    u1: {
      u2: { id: 'u1-2', type: 'undirected' },
      u3: { id: 'u1-3', type: 'undirected' },
    },
    u2: { u3: { id: 'u2-3', type: 'undirected' } },
    u3: {},
  },
};

const graphCrossLayer: NxGraphInput = {
  nodes: {
    t1: { label: 'Top A' },
    t2: { label: 'Top B' },
    m1: { label: 'Mid A' },
    m2: { label: 'Mid B' },
    m3: { label: 'Mid C' },
    b1: { label: 'Bottom A' },
    b2: { label: 'Bottom B' },
  },
  adj: {
    t1: {
      m1: { id: 't1-m1', type: 'directed' },
      m2: { id: 't1-m2', type: 'directed' },
    },
    t2: {
      m2: { id: 't2-m2', type: 'directed' },
      m3: { id: 't2-m3', type: 'directed' },
    },
    m1: {
      b1: { id: 'm1-b1', type: 'directed' },
      b2: { id: 'm1-b2', type: 'directed' },
    },
    m2: {
      b1: { id: 'm2-b1', type: 'directed' },
      b2: { id: 'm2-b2', type: 'directed' },
    },
    m3: { b2: { id: 'm3-b2', type: 'directed' } },
    b1: {},
    b2: {},
  },
};

const graphMixedTypes: NxGraphInput = {
  nodes: {
    mx1: { label: 'Hub' },
    mx2: { label: 'Left' },
    mx3: { label: 'Right' },
    mx4: { label: 'Child L1' },
    mx5: { label: 'Child R1' },
    mx6: { label: 'Bridge' },
  },
  adj: {
    mx1: {
      mx2: { id: 'mx1-2', type: 'directed' },
      mx3: { id: 'mx1-3', type: 'directed' },
      mx6: { id: 'mx1-6', type: 'undirected' },
    },
    mx2: {
      mx4: { id: 'mx2-4', type: 'undirected' },
      mx6: { id: 'mx2-6', type: 'undirected' },
    },
    mx3: {
      mx5: { id: 'mx3-5', type: 'undirected' },
      mx6: { id: 'mx3-6', type: 'directed' },
    },
    mx4: {},
    mx5: {},
    mx6: {},
  },
};

const graphMesh: NxGraphInput = {
  nodes: {
    g1: { label: 'P1' },
    g2: { label: 'P2' },
    g3: { label: 'P3' },
    g4: { label: 'P4' },
    g5: { label: 'P5' },
    g6: { label: 'P6' },
  },
  adj: {
    g1: {
      g2: { id: 'g1-2', type: 'directed' },
      g3: { id: 'g1-3', type: 'directed' },
      g4: { id: 'g1-4', type: 'directed' },
    },
    g2: {
      g5: { id: 'g2-5', type: 'directed' },
      g6: { id: 'g2-6', type: 'directed' },
    },
    g3: {
      g5: { id: 'g3-5', type: 'directed' },
      g6: { id: 'g3-6', type: 'directed' },
    },
    g4: {
      g5: { id: 'g4-5', type: 'directed' },
      g6: { id: 'g4-6', type: 'directed' },
    },
    g5: {},
    g6: {},
  },
};

const graphNx: NxGraphInput = {
  nodes: {
    g1: { label: 'Alpha' },
    g2: { label: 'Beta' },
    g3: { label: 'Gamma' },
  },
  adj: {
    g1: { g2: {}, g3: {} },
    g2: { g3: {} },
    g3: { g1: {} },
  },
};

const meta: Meta<typeof Graph> = {
  title: 'Graph/Core',
  component: Graph,
  args: {
    graph: graphSimple,
    vertexComponent: DemoNode,
    config: {
      width: 800,
      height: 480,
      curveEdges: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof Graph>;

export const Default: Story = {};

export const TwentyNodes: Story = {
  args: {
    graph: graphTwenty,
    vertexComponent: DemoNode,
    config: {
      width: 1300,
      height: 760,
      padding: 24,
      curveStrength: 0.35,
      layout: 'tree',
      layoutDirection: 'ltr',
      hoverHighlight: true,
      theme: {
        background: '#0b0f16',
      },
    },
  },
};

export const Undirected: Story = {
  args: {
    graph: graphUndirected,
    vertexComponent: DemoNode,
    config: {
      width: 640,
      height: 480,
      defaultEdgeType: 'undirected',
      layout: 'centered',
      curveEdges: false,
      theme: {
        background: '#0c0f18',
      },
    },
  },
};

export const NetworkXInput: Story = {
  args: {
    graph: graphNx,
    vertexComponent: DemoNode,
    config: {
      width: 640,
      height: 480,
      defaultEdgeType: 'undirected',
      curveStrength: 0.2,
      padding: 24,
      layout: 'grid',
      theme: {
        background: '#0c0f18',
      },
    },
  },
};

export const CrossLayerCurved: Story = {
  args: {
    graph: graphCrossLayer,
    vertexComponent: DemoNode,
    config: {
      width: 1200,
      height: 780,
      padding: 32,
      curveEdges: true,
      curveStrength: 0.4,
      layout: 'tree',
      theme: {
        background: '#0b0f16',
      },
    },
  },
};

export const MixedTypesCentered: Story = {
  args: {
    graph: graphMixedTypes,
    vertexComponent: DemoNode,
    config: {
      width: 900,
      height: 620,
      padding: 28,
      curveEdges: true,
      curveStrength: 0.32,
      layout: 'centered',
      defaultEdgeType: 'directed',
      theme: {
        background: '#0c0f18',
      },
    },
  },
};

export const DenseMeshStraight: Story = {
  args: {
    graph: graphMesh,
    vertexComponent: DemoNode,
    config: {
      width: 1100,
      height: 720,
      padding: 24,
      curveEdges: false,
      layout: 'grid',
      theme: {
        background: '#0b1019',
      },
    },
  },
};
