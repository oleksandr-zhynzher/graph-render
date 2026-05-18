import React from 'react';
import { Graph } from '@graph-render/react';
import type { NxGraphInput, VertexComponentProps } from '@graph-render/types';
import { LayoutType } from '@graph-render/types';
import type { Meta, StoryObj } from '@storybook/react';

// ── Shared node renderers ─────────────────────────────────────────────────

function DarkNode({ node, isSelected, isHovered }: VertexComponentProps) {
  const w = node.size?.width ?? 180;
  const h = node.size?.height ?? 72;
  return (
    <foreignObject width={w} height={h} requiredExtensions="http://www.w3.org/1999/xhtml">
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          padding: '10px 14px',
          borderRadius: 8,
          background: isSelected ? '#1e3a5f' : isHovered ? '#222b3d' : '#1b1f2a',
          color: '#e5ecff',
          border: `1.5px solid ${isSelected ? '#58a6ff' : isHovered ? '#4a6fa5' : '#324569'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          justifyContent: 'center',
          transition: 'background 0.15s, border-color 0.15s',
          cursor: 'pointer',
        }}
      >
        <strong style={{ fontSize: 13, lineHeight: 1.3 }}>{node.label ?? node.id}</strong>
        <small style={{ opacity: 0.5, fontSize: 11 }}>{node.id}</small>
      </div>
    </foreignObject>
  );
}

// ── Graph data ────────────────────────────────────────────────────────────

const graphSimple: NxGraphInput = {
  nodes: {
    root: { label: 'Root' },
    a: { label: 'Child A' },
    b: { label: 'Child B' },
    c: { label: 'Child C' },
    a1: { label: 'Leaf A1' },
    a2: { label: 'Leaf A2' },
    b1: { label: 'Leaf B1' },
    c1: { label: 'Leaf C1' },
  },
  adj: {
    root: {
      a: { id: 'r-a', type: 'directed' },
      b: { id: 'r-b', type: 'directed' },
      c: { id: 'r-c', type: 'directed' },
    },
    a: {
      a1: { id: 'a-a1', type: 'directed' },
      a2: { id: 'a-a2', type: 'directed' },
    },
    b: { b1: { id: 'b-b1', type: 'directed' } },
    c: { c1: { id: 'c-c1', type: 'directed' } },
    a1: {},
    a2: {},
    b1: {},
    c1: {},
  },
};

const graphDag: NxGraphInput = {
  nodes: {
    build: { label: 'Build' },
    test: { label: 'Test' },
    lint: { label: 'Lint' },
    bundle: { label: 'Bundle' },
    deploy: { label: 'Deploy' },
    notify: { label: 'Notify' },
    cache: { label: 'Cache' },
  },
  adj: {
    build: {
      test: { id: 'build-test', type: 'directed' },
      lint: { id: 'build-lint', type: 'directed' },
      bundle: { id: 'build-bundle', type: 'directed' },
    },
    test: { deploy: { id: 'test-deploy', type: 'directed' } },
    lint: { deploy: { id: 'lint-deploy', type: 'directed' } },
    bundle: {
      deploy: { id: 'bundle-deploy', type: 'directed' },
      cache: { id: 'bundle-cache', type: 'directed' },
    },
    deploy: { notify: { id: 'deploy-notify', type: 'directed' } },
    cache: {},
    notify: {},
  },
};

const graphRadial: NxGraphInput = {
  nodes: {
    hub: { label: 'Core' },
    api: { label: 'API' },
    db: { label: 'Database' },
    auth: { label: 'Auth' },
    cache: { label: 'Cache' },
    queue: { label: 'Queue' },
    logs: { label: 'Logs' },
    cdn: { label: 'CDN' },
    s3: { label: 'Storage' },
  },
  adj: {
    hub: {
      api: { id: 'h-api' },
      db: { id: 'h-db' },
      auth: { id: 'h-auth' },
      cache: { id: 'h-cache' },
      queue: { id: 'h-queue' },
      logs: { id: 'h-logs' },
      cdn: { id: 'h-cdn' },
      s3: { id: 'h-s3' },
    },
    api: {},
    db: {},
    auth: {},
    cache: {},
    queue: {},
    logs: {},
    cdn: {},
    s3: {},
  },
};

const graphGrid: NxGraphInput = {
  nodes: Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => [`n${i + 1}`, { label: `Node ${i + 1}` }])
  ),
  adj: {
    n1: { n2: { id: 'e1' }, n5: { id: 'e2' } },
    n2: { n3: { id: 'e3' }, n6: { id: 'e4' } },
    n3: { n4: { id: 'e5' }, n7: { id: 'e6' } },
    n4: { n8: { id: 'e7' } },
    n5: { n6: { id: 'e8' }, n9: { id: 'e9' } },
    n6: { n7: { id: 'e10' }, n10: { id: 'e11' } },
    n7: { n8: { id: 'e12' }, n11: { id: 'e13' } },
    n8: { n12: { id: 'e14' } },
    n9: { n10: { id: 'e15' } },
    n10: { n11: { id: 'e16' } },
    n11: { n12: { id: 'e17' } },
    n12: {},
  },
};

const graphForceDirected: NxGraphInput = {
  nodes: {
    react: { label: 'React' },
    redux: { label: 'Redux' },
    router: { label: 'Router' },
    query: { label: 'Query' },
    vite: { label: 'Vite' },
    ts: { label: 'TypeScript' },
    eslint: { label: 'ESLint' },
    jest: { label: 'Jest' },
    storybook: { label: 'Storybook' },
    vitest: { label: 'Vitest' },
    tailwind: { label: 'Tailwind' },
  },
  adj: {
    react: {
      redux: { id: 'r-rdx' },
      router: { id: 'r-rtr' },
      query: { id: 'r-qry' },
    },
    redux: { ts: { id: 'rdx-ts' } },
    router: { ts: { id: 'rtr-ts' } },
    query: { ts: { id: 'qry-ts' } },
    vite: {
      ts: { id: 'v-ts' },
      tailwind: { id: 'v-tw' },
    },
    ts: {
      eslint: { id: 'ts-eslint' },
      jest: { id: 'ts-jest' },
      vitest: { id: 'ts-vitest' },
    },
    eslint: { storybook: { id: 'e-sb' } },
    jest: {},
    storybook: {},
    vitest: {},
    tailwind: {},
  },
};

// ── Meta ──────────────────────────────────────────────────────────────────

const meta: Meta<typeof Graph> = {
  title: 'Graph/Layouts',
  component: Graph,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    vertexComponent: DarkNode,
    config: {
      width: 960,
      height: 540,
      padding: 32,
      theme: { background: '#0d1117' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Graph>;

// ── Layout stories ────────────────────────────────────────────────────────

export const Tree: Story = {
  name: 'Tree — top-down hierarchy',
  args: {
    graph: graphSimple,
    config: {
      width: 960,
      height: 540,
      padding: 32,
      layout: LayoutType.Tree,
      curveEdges: true,
      curveStrength: 0.4,
      hoverHighlight: true,
      theme: { background: '#0d1117' },
    },
  },
};

export const TreeLTR: Story = {
  name: 'Tree — left-to-right',
  args: {
    graph: graphDag,
    config: {
      width: 960,
      height: 540,
      padding: 40,
      layout: LayoutType.Tree,
      layoutDirection: 'ltr',
      curveEdges: true,
      curveStrength: 0.35,
      hoverHighlight: true,
      theme: { background: '#0b0f16' },
    },
  },
};

export const DAG: Story = {
  name: 'DAG — CI pipeline',
  args: {
    graph: graphDag,
    config: {
      width: 960,
      height: 540,
      padding: 40,
      layout: LayoutType.Dag,
      curveEdges: true,
      curveStrength: 0.3,
      hoverHighlight: true,
      theme: { background: '#0b0f16' },
    },
  },
};

export const Radial: Story = {
  name: 'Radial — hub & spoke',
  args: {
    graph: graphRadial,
    config: {
      width: 960,
      height: 540,
      padding: 40,
      layout: LayoutType.Radial,
      curveEdges: false,
      theme: { background: '#0b0f16' },
    },
  },
};

export const Centered: Story = {
  name: 'Centered — balanced placement',
  args: {
    graph: graphSimple,
    config: {
      width: 960,
      height: 540,
      padding: 48,
      layout: LayoutType.Centered,
      curveEdges: true,
      curveStrength: 0.25,
      theme: { background: '#0d1117' },
    },
  },
};

export const Grid: Story = {
  name: 'Grid — uniform columns',
  args: {
    graph: graphGrid,
    config: {
      width: 960,
      height: 540,
      padding: 32,
      layout: LayoutType.Grid,
      curveEdges: false,
      theme: { background: '#0b0f16' },
    },
  },
};

export const ForceDirected: Story = {
  name: 'Force-Directed — organic clusters',
  args: {
    graph: graphForceDirected,
    config: {
      width: 960,
      height: 540,
      padding: 32,
      layout: LayoutType.ForceDirected,
      curveEdges: false,
      hoverHighlight: true,
      theme: { background: '#060b12' },
    },
  },
};
