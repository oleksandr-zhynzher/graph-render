import { Graph } from '@graph-render/react';
import type { NxGraphInput, VertexComponentProps } from '@graph-render/types';
import { LayoutType } from '@graph-render/types';
import type { Meta, StoryObj } from '@storybook/react';

import { graphStoryActionArgs } from '../../graphStoryArgs';

// ── Status colours ────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  success: '#238636',
  warning: '#9e6a03',
  error: '#da3633',
  pending: '#388bfd',
  idle: '#30363d',
};

// ── Node: minimal pill ────────────────────────────────────────────────────

function PillNode({ node, isHovered }: VertexComponentProps) {
  const w = node.size?.width ?? 140;
  const h = node.size?.height ?? 44;
  return (
    <foreignObject width={w} height={h} requiredExtensions="http://www.w3.org/1999/xhtml">
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          borderRadius: 22,
          background: isHovered ? '#1f6feb' : '#21262d',
          color: '#e5ecff',
          border: `1px solid ${isHovered ? '#388bfd' : '#30363d'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 0.3,
          transition: 'all 0.15s',
          cursor: 'pointer',
        }}
      >
        {node.label ?? node.id}
      </div>
    </foreignObject>
  );
}

// ── Node: status card ─────────────────────────────────────────────────────

function StatusNode({ node, isHovered }: VertexComponentProps) {
  const w = node.size?.width ?? 180;
  const h = node.size?.height ?? 68;
  const status = (node.meta as Record<string, string> | undefined)?.status ?? 'idle';
  const color = STATUS_COLOR[status] ?? STATUS_COLOR.idle;
  return (
    <foreignObject width={w} height={h} requiredExtensions="http://www.w3.org/1999/xhtml">
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          borderRadius: 8,
          background: isHovered ? '#1a2030' : '#161b22',
          color: '#e5ecff',
          border: `1px solid ${isHovered ? '#30363d' : '#21262d'}`,
          borderLeft: `4px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 14px',
          transition: 'all 0.15s',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{node.label ?? node.id}</div>
          <div
            style={{ fontSize: 11, opacity: 0.55, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            {status}
          </div>
        </div>
      </div>
    </foreignObject>
  );
}

// ── Node: light card ──────────────────────────────────────────────────────

function LightNode({ node, isSelected, isHovered }: VertexComponentProps) {
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
          borderRadius: 8,
          background: isSelected ? '#dbeafe' : isHovered ? '#f0f4ff' : '#ffffff',
          color: '#0f172a',
          border: `1.5px solid ${isSelected ? '#3b82f6' : isHovered ? '#93c5fd' : '#e2e8f0'}`,
          boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 2,
          transition: 'all 0.15s',
          cursor: 'pointer',
        }}
      >
        <strong style={{ fontSize: 13 }}>{node.label ?? node.id}</strong>
        <small style={{ opacity: 0.5, fontSize: 11 }}>{node.id}</small>
      </div>
    </foreignObject>
  );
}

// ── Node: badge / step ────────────────────────────────────────────────────

function StepNode({ node, isHovered }: VertexComponentProps) {
  const w = node.size?.width ?? 160;
  const h = node.size?.height ?? 56;
  const step = (node.meta as Record<string, number> | undefined)?.step;
  return (
    <foreignObject width={w} height={h} requiredExtensions="http://www.w3.org/1999/xhtml">
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          borderRadius: 8,
          background: isHovered ? '#1a2233' : '#0d1117',
          color: '#e5ecff',
          border: `1px solid ${isHovered ? '#58a6ff' : '#21262d'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 12px',
          transition: 'all 0.15s',
          cursor: 'pointer',
        }}
      >
        {step !== undefined ? (
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#1f6feb',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {step}
          </span>
        ) : null}
        <span style={{ fontSize: 13, fontWeight: 600 }}>{node.label ?? node.id}</span>
      </div>
    </foreignObject>
  );
}

// ── Graph data ────────────────────────────────────────────────────────────

const pipelineGraph: NxGraphInput = {
  nodes: {
    checkout: { label: 'Checkout', meta: { status: 'success', step: 1 } },
    install: { label: 'Install', meta: { status: 'success', step: 2 } },
    build: { label: 'Build', meta: { status: 'pending', step: 3 } },
    test: { label: 'Test', meta: { status: 'pending', step: 4 } },
    lint: { label: 'Lint', meta: { status: 'warning', step: 4 } },
    deploy: { label: 'Deploy', meta: { status: 'idle', step: 5 } },
    notify: { label: 'Notify', meta: { status: 'idle', step: 6 } },
  },
  adj: {
    checkout: { install: { id: 'e1', type: 'directed' } },
    install: {
      build: { id: 'e2', type: 'directed' },
      lint: { id: 'e3', type: 'directed' },
    },
    build: { test: { id: 'e4', type: 'directed' } },
    test: { deploy: { id: 'e5', type: 'directed' } },
    lint: { deploy: { id: 'e6', type: 'directed' } },
    deploy: { notify: { id: 'e7', type: 'directed' } },
    notify: {},
  },
};

const orgGraph: NxGraphInput = {
  nodes: {
    ceo: { label: 'CEO' },
    cto: { label: 'CTO' },
    cfo: { label: 'CFO' },
    vp_eng: { label: 'VP Engineering' },
    vp_design: { label: 'VP Design' },
    fe: { label: 'Frontend' },
    be: { label: 'Backend' },
    infra: { label: 'Infra' },
    ux: { label: 'UX' },
  },
  adj: {
    ceo: {
      cto: { id: 'ceo-cto', type: 'directed' },
      cfo: { id: 'ceo-cfo', type: 'directed' },
    },
    cto: {
      vp_eng: { id: 'cto-vpe', type: 'directed' },
      vp_design: { id: 'cto-vpd', type: 'directed' },
    },
    vp_eng: {
      fe: { id: 'vpe-fe', type: 'directed' },
      be: { id: 'vpe-be', type: 'directed' },
      infra: { id: 'vpe-infra', type: 'directed' },
    },
    vp_design: { ux: { id: 'vpd-ux', type: 'directed' } },
    cfo: {},
    fe: {},
    be: {},
    infra: {},
    ux: {},
  },
};

const simpleGraph: NxGraphInput = {
  nodes: {
    a: { label: 'Alpha' },
    b: { label: 'Beta' },
    c: { label: 'Gamma' },
    d: { label: 'Delta' },
    e: { label: 'Epsilon' },
    f: { label: 'Zeta' },
  },
  adj: {
    a: { b: { id: 'ab' }, c: { id: 'ac' } },
    b: { d: { id: 'bd' }, e: { id: 'be' } },
    c: { e: { id: 'ce' }, f: { id: 'cf' } },
    d: {},
    e: {},
    f: {},
  },
};

// ── Meta ──────────────────────────────────────────────────────────────────

const meta: Meta<typeof Graph> = {
  title: 'Graph/Node Styles',
  component: Graph,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: graphStoryActionArgs,
};

export default meta;

type Story = StoryObj<typeof Graph>;

export const DarkCards: Story = {
  name: 'Dark cards — default style',
  args: {
    graph: orgGraph,
    vertexComponent: (props) => {
      const { node, isSelected, isHovered } = props;
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
              borderRadius: 8,
              background: isSelected ? '#1e3a5f' : isHovered ? '#1f2a3d' : '#161b22',
              color: '#e5ecff',
              border: `1.5px solid ${isSelected ? '#58a6ff' : isHovered ? '#4a6fa5' : '#30363d'}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 2,
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
    },
    config: {
      width: 960,
      height: 540,
      padding: 40,
      layout: LayoutType.Tree,
      curveEdges: true,
      curveStrength: 0.4,
      hoverHighlight: true,
      theme: { background: '#0d1117' },
    },
  },
};

export const LightCards: Story = {
  name: 'Light cards — white theme',
  args: {
    graph: orgGraph,
    vertexComponent: LightNode,
    config: {
      width: 960,
      height: 540,
      padding: 40,
      layout: LayoutType.Tree,
      curveEdges: true,
      curveStrength: 0.4,
      hoverHighlight: true,
      theme: { background: '#f6f8fa', edgeColor: '#d0d7de' },
    },
  },
};

export const Pills: Story = {
  name: 'Pill nodes — compact minimal',
  args: {
    graph: simpleGraph,
    vertexComponent: PillNode,
    config: {
      width: 960,
      height: 480,
      padding: 60,
      layout: LayoutType.Tree,
      curveEdges: true,
      curveStrength: 0.4,
      hoverHighlight: true,
      fixedNodeSize: { width: 140, height: 44 },
      theme: { background: '#0d1117', nodeGap: 32 },
    },
  },
};

export const StatusNodes: Story = {
  name: 'Status nodes — live pipeline',
  args: {
    graph: pipelineGraph,
    vertexComponent: StatusNode,
    config: {
      width: 960,
      height: 520,
      padding: 40,
      layout: LayoutType.Dag,
      curveEdges: true,
      curveStrength: 0.35,
      hoverHighlight: true,
      theme: { background: '#0b0f16' },
    },
  },
};

export const StepNodes: Story = {
  name: 'Step nodes — numbered workflow',
  args: {
    graph: pipelineGraph,
    vertexComponent: StepNode,
    config: {
      width: 960,
      height: 520,
      padding: 40,
      layout: LayoutType.Dag,
      curveEdges: true,
      curveStrength: 0.35,
      hoverHighlight: true,
      fixedNodeSize: { width: 160, height: 56 },
      theme: { background: '#060b12' },
    },
  },
};
