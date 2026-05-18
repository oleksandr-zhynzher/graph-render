import React from 'react';
import { Graph } from '@graph-render/react';
import type { NxGraphInput, VertexComponentProps } from '@graph-render/types';
import { LayoutType, RoutingStyle } from '@graph-render/types';
import type { Meta, StoryObj } from '@storybook/react';

// ── Shared graph ──────────────────────────────────────────────────────────

const dependencyGraph: NxGraphInput = {
  nodes: {
    app: { label: 'App' },
    auth: { label: 'Auth' },
    api: { label: 'API Client' },
    store: { label: 'Store' },
    ui: { label: 'UI Kit' },
    utils: { label: 'Utils' },
    types: { label: 'Types' },
    logger: { label: 'Logger' },
  },
  adj: {
    app: {
      auth: { id: 'app-auth', type: 'directed' },
      api: { id: 'app-api', type: 'directed' },
      store: { id: 'app-store', type: 'directed' },
      ui: { id: 'app-ui', type: 'directed' },
    },
    auth: {
      api: { id: 'auth-api', type: 'directed' },
      utils: { id: 'auth-utils', type: 'directed' },
    },
    api: {
      types: { id: 'api-types', type: 'directed' },
      logger: { id: 'api-logger', type: 'directed' },
    },
    store: {
      types: { id: 'store-types', type: 'directed' },
    },
    ui: {
      utils: { id: 'ui-utils', type: 'directed' },
    },
    utils: { types: { id: 'utils-types', type: 'directed' } },
    types: {},
    logger: {},
  },
};

// ── Node renderers ────────────────────────────────────────────────────────

function DarkNode({ node, isHovered, isSelected }: VertexComponentProps) {
  const w = node.size?.width ?? 160;
  const h = node.size?.height ?? 56;
  return (
    <foreignObject width={w} height={h} requiredExtensions="http://www.w3.org/1999/xhtml">
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          padding: '0 16px',
          borderRadius: 8,
          background: isSelected ? '#1e3a5f' : isHovered ? '#1f2a3d' : '#161b22',
          color: '#e5ecff',
          border: `1.5px solid ${isSelected ? '#58a6ff' : isHovered ? '#4a6fa5' : '#30363d'}`,
          display: 'flex',
          alignItems: 'center',
          fontSize: 13,
          fontWeight: 600,
          transition: 'all 0.15s',
          cursor: 'pointer',
        }}
      >
        {node.label ?? node.id}
      </div>
    </foreignObject>
  );
}

function LightNode({ node, isHovered, isSelected }: VertexComponentProps) {
  const w = node.size?.width ?? 160;
  const h = node.size?.height ?? 56;
  return (
    <foreignObject width={w} height={h} requiredExtensions="http://www.w3.org/1999/xhtml">
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          padding: '0 16px',
          borderRadius: 8,
          background: isSelected ? '#dbeafe' : isHovered ? '#f0f6ff' : '#ffffff',
          color: '#0f172a',
          border: `1.5px solid ${isSelected ? '#3b82f6' : isHovered ? '#93c5fd' : '#e2e8f0'}`,
          boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.10)' : '0 1px 2px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          fontSize: 13,
          fontWeight: 600,
          transition: 'all 0.15s',
          cursor: 'pointer',
        }}
      >
        {node.label ?? node.id}
      </div>
    </foreignObject>
  );
}

function GreenNode({ node, isHovered }: VertexComponentProps) {
  const w = node.size?.width ?? 160;
  const h = node.size?.height ?? 56;
  return (
    <foreignObject width={w} height={h} requiredExtensions="http://www.w3.org/1999/xhtml">
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          padding: '0 16px',
          borderRadius: 8,
          background: isHovered ? '#0d2a1a' : '#0b1e14',
          color: '#d4fada',
          border: `1.5px solid ${isHovered ? '#3fb950' : '#1e3d28'}`,
          display: 'flex',
          alignItems: 'center',
          fontSize: 13,
          fontWeight: 600,
          transition: 'all 0.15s',
          cursor: 'pointer',
        }}
      >
        {node.label ?? node.id}
      </div>
    </foreignObject>
  );
}

function PurpleNode({ node, isHovered }: VertexComponentProps) {
  const w = node.size?.width ?? 160;
  const h = node.size?.height ?? 56;
  return (
    <foreignObject width={w} height={h} requiredExtensions="http://www.w3.org/1999/xhtml">
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          padding: '0 16px',
          borderRadius: 8,
          background: isHovered ? '#1f1548' : '#150f2e',
          color: '#ede8ff',
          border: `1.5px solid ${isHovered ? '#bc8cff' : '#2a1f4a'}`,
          display: 'flex',
          alignItems: 'center',
          fontSize: 13,
          fontWeight: 600,
          transition: 'all 0.15s',
          cursor: 'pointer',
        }}
      >
        {node.label ?? node.id}
      </div>
    </foreignObject>
  );
}

function AmberNode({ node, isHovered }: VertexComponentProps) {
  const w = node.size?.width ?? 160;
  const h = node.size?.height ?? 56;
  return (
    <foreignObject width={w} height={h} requiredExtensions="http://www.w3.org/1999/xhtml">
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          padding: '0 16px',
          borderRadius: 8,
          background: isHovered ? '#2a1d00' : '#1c1200',
          color: '#fff8e0',
          border: `1.5px solid ${isHovered ? '#e3a008' : '#3d2c00'}`,
          display: 'flex',
          alignItems: 'center',
          fontSize: 13,
          fontWeight: 600,
          transition: 'all 0.15s',
          cursor: 'pointer',
        }}
      >
        {node.label ?? node.id}
      </div>
    </foreignObject>
  );
}

// ── Meta ──────────────────────────────────────────────────────────────────

const meta: Meta<typeof Graph> = {
  title: 'Graph/Theming',
  component: Graph,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof Graph>;

const BASE_CONFIG = {
  width: 960,
  height: 520,
  padding: 40,
  layout: LayoutType.Dag,
  routingStyle: RoutingStyle.Smart,
  curveEdges: true,
  curveStrength: 0.35,
  hoverHighlight: true,
};

// ── Stories ───────────────────────────────────────────────────────────────

export const Dark: Story = {
  name: 'Dark — GitHub-style',
  args: {
    graph: dependencyGraph,
    vertexComponent: DarkNode,
    config: {
      ...BASE_CONFIG,
      theme: {
        background: '#0d1117',
        edgeColor: '#30363d',
        edgeWidth: 1.5,
        nodeGap: 28,
      },
    },
  },
};

export const Light: Story = {
  name: 'Light — white surface',
  args: {
    graph: dependencyGraph,
    vertexComponent: LightNode,
    config: {
      ...BASE_CONFIG,
      theme: {
        background: '#f6f8fa',
        edgeColor: '#d0d7de',
        edgeWidth: 1.5,
        nodeGap: 28,
      },
    },
  },
};

export const GreenAccent: Story = {
  name: 'Green accent — forest',
  args: {
    graph: dependencyGraph,
    vertexComponent: GreenNode,
    config: {
      ...BASE_CONFIG,
      theme: {
        background: '#060e09',
        edgeColor: '#1e3d28',
        edgeWidth: 1.5,
        nodeGap: 28,
      },
    },
  },
};

export const PurpleAccent: Story = {
  name: 'Purple accent — midnight',
  args: {
    graph: dependencyGraph,
    vertexComponent: PurpleNode,
    config: {
      ...BASE_CONFIG,
      theme: {
        background: '#0d0b1a',
        edgeColor: '#2a1f4a',
        edgeWidth: 1.5,
        nodeGap: 28,
      },
    },
  },
};

export const AmberAccent: Story = {
  name: 'Amber accent — warm dark',
  args: {
    graph: dependencyGraph,
    vertexComponent: AmberNode,
    config: {
      ...BASE_CONFIG,
      theme: {
        background: '#0e0900',
        edgeColor: '#3d2c00',
        edgeWidth: 1.5,
        nodeGap: 28,
      },
    },
  },
};

export const ThickEdges: Story = {
  name: 'Thick edges — high-contrast',
  args: {
    graph: dependencyGraph,
    vertexComponent: DarkNode,
    config: {
      ...BASE_CONFIG,
      theme: {
        background: '#0d1117',
        edgeColor: '#58a6ff',
        edgeWidth: 3,
        nodeGap: 30,
      },
    },
  },
};

export const DottedCanvas: Story = {
  name: 'Wide spacing — sparse layout',
  args: {
    graph: dependencyGraph,
    vertexComponent: LightNode,
    config: {
      ...BASE_CONFIG,
      layout: LayoutType.Tree,
      theme: {
        background: '#ffffff',
        edgeColor: '#94a3b8',
        edgeWidth: 1,
        nodeGap: 60,
      },
    },
  },
};
