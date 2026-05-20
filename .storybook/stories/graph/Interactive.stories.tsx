import { Graph } from '@graph-render/react';
import type { NxGraphInput, VertexComponentProps } from '@graph-render/types';
import { LayoutType } from '@graph-render/types';
import type { Meta, StoryObj } from '@storybook/react';
import { useState, type ReactNode } from 'react';

import { graphStoryActionArgs } from '../../graphStoryArgs';

// ── Node: dark card ───────────────────────────────────────────────────────

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
          background: isSelected ? '#1e3a5f' : isHovered ? '#1f2835' : '#161b22',
          color: '#e5ecff',
          border: `1.5px solid ${isSelected ? '#58a6ff' : isHovered ? '#4a6fa5' : '#30363d'}`,
          display: 'flex',
          alignItems: 'center',
          fontWeight: 600,
          fontSize: 13,
          transition: 'all 0.15s',
          cursor: 'pointer',
        }}
      >
        {node.label ?? node.id}
      </div>
    </foreignObject>
  );
}

// ── Shared graph ──────────────────────────────────────────────────────────

const workflowGraph: NxGraphInput = {
  nodes: {
    checkout: { label: 'Checkout' },
    install: { label: 'Install' },
    build: { label: 'Build' },
    test: { label: 'Test' },
    lint: { label: 'Lint' },
    typecheck: { label: 'Typecheck' },
    bundle: { label: 'Bundle' },
    publish: { label: 'Publish' },
    notify: { label: 'Notify' },
  },
  adj: {
    checkout: {
      install: { id: 'co-in', type: 'directed' },
    },
    install: {
      build: { id: 'in-bu', type: 'directed' },
      lint: { id: 'in-li', type: 'directed' },
      typecheck: { id: 'in-tc', type: 'directed' },
    },
    build: {
      test: { id: 'bu-te', type: 'directed' },
      bundle: { id: 'bu-bn', type: 'directed' },
    },
    test: { publish: { id: 'te-pu', type: 'directed' } },
    lint: { publish: { id: 'li-pu', type: 'directed' } },
    typecheck: { publish: { id: 'tc-pu', type: 'directed' } },
    bundle: { publish: { id: 'bn-pu', type: 'directed' } },
    publish: { notify: { id: 'pu-no', type: 'directed' } },
    notify: {},
  },
};

// ── Interactive wrapper for hover/selection callbacks ────────────────────

function InteractiveWrapper({
  children,
  events,
}: {
  readonly children: ReactNode;
  readonly events: string[];
}) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: 8,
          padding: '8px 14px',
          fontSize: 12,
          color: '#8b949e',
          maxWidth: 320,
          maxHeight: 120,
          overflow: 'hidden',
          fontFamily: 'monospace',
        }}
      >
        {events.length === 0 ? (
          <span>Interact with nodes and edges…</span>
        ) : (
          events
            .slice(-5)
            .reverse()
            .map((e, i) => (
              <div key={i} style={{ opacity: 1 - i * 0.2 }}>
                {e}
              </div>
            ))
        )}
      </div>
    </div>
  );
}

// ── Search wrapper ────────────────────────────────────────────────────────

function SearchWrapper() {
  const [query, setQuery] = useState('');
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0d1117' }}
    >
      <div
        style={{
          padding: '12px 20px',
          background: '#161b22',
          borderBottom: '1px solid #30363d',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ color: '#8b949e', fontSize: 13, fontFamily: 'monospace' }}>⌕</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search nodes by label…"
          style={{
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: 6,
            padding: '6px 12px',
            color: '#e5ecff',
            fontSize: 13,
            width: 260,
          }}
        />
        {query ? (
          <button
            onClick={() => setQuery('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#8b949e',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Clear
          </button>
        ) : null}
      </div>
      <div style={{ flex: 1 }}>
        <Graph
          graph={workflowGraph}
          vertexComponent={DarkNode}
          searchQuery={query}
          config={{
            width: 960,
            height: 580,
            padding: 40,
            layout: LayoutType.Dag,
            curveEdges: true,
            curveStrength: 0.35,
            hoverHighlight: true,
            theme: { background: '#0d1117' },
          }}
        />
      </div>
    </div>
  );
}

// ── Collapse wrapper ──────────────────────────────────────────────────────

function CollapseWrapper() {
  const [collapsed, setCollapsed] = useState<readonly string[]>([]);
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0d1117' }}
    >
      <div
        style={{
          padding: '12px 20px',
          background: '#161b22',
          borderBottom: '1px solid #30363d',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: '#8b949e', fontSize: 12 }}>
          Double-click nodes to collapse, or toggle:
        </span>
        {['install', 'build'].map((id) => (
          <button
            key={id}
            onClick={() =>
              setCollapsed((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
            }
            style={{
              background: collapsed.includes(id) ? '#1f6feb' : '#21262d',
              border: '1px solid #30363d',
              borderRadius: 5,
              color: '#e5ecff',
              padding: '4px 10px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {collapsed.includes(id) ? '▶' : '▼'} {id}
          </button>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <Graph
          graph={workflowGraph}
          vertexComponent={DarkNode}
          collapsedNodeIds={collapsed}
          onCollapsedNodeIdsChange={setCollapsed}
          toggleCollapseOnNodeDoubleClick
          config={{
            width: 960,
            height: 580,
            padding: 40,
            layout: LayoutType.Dag,
            curveEdges: true,
            curveStrength: 0.35,
            hoverHighlight: true,
            theme: { background: '#0d1117' },
          }}
        />
      </div>
    </div>
  );
}

// ── Meta ──────────────────────────────────────────────────────────────────

const meta: Meta<typeof Graph> = {
  title: 'Graph/Interactive',
  component: Graph,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: graphStoryActionArgs,
};

export default meta;

type Story = StoryObj<typeof Graph>;

// ── Story wrapper components ──────────────────────────────────────────────

const HOVER_CONFIG = {
  width: 960,
  height: 600,
  padding: 40,
  layout: LayoutType.Dag,
  curveEdges: true,
  curveStrength: 0.35,
  hoverHighlight: true,
  hoverEdgeColor: '#58a6ff',
  hoverNodeInColor: '#3fb950',
  hoverNodeOutColor: '#f85149',
  theme: { background: '#0d1117' },
};

function HoverHighlightStory() {
  const [events, setEvents] = useState<string[]>([]);
  const add = (msg: string) => setEvents((e) => [...e, msg]);
  return (
    <InteractiveWrapper events={events}>
      <Graph
        graph={workflowGraph}
        vertexComponent={DarkNode}
        config={HOVER_CONFIG}
        onNodeHoverChange={(node, hovered) =>
          add(`${hovered ? '→' : '←'} node "${node.data.label ?? node.id}"`)
        }
        onEdgeHoverChange={(edge, hovered) => add(`${hovered ? '→' : '←'} edge ${edge.id}`)}
      />
    </InteractiveWrapper>
  );
}

const SELECTION_CONFIG = {
  width: 960,
  height: 600,
  padding: 40,
  layout: LayoutType.Dag,
  curveEdges: true,
  curveStrength: 0.35,
  theme: { background: '#0d1117' },
};

function SelectionStory() {
  const [events, setEvents] = useState<string[]>([]);
  return (
    <InteractiveWrapper events={events}>
      <Graph
        graph={workflowGraph}
        vertexComponent={DarkNode}
        showControls
        marqueeSelectionEnabled
        config={SELECTION_CONFIG}
        onSelectionChange={(sel) =>
          setEvents((e) => [...e, `Selected: [${sel.nodeIds.join(', ')}]`])
        }
        onNodeClick={(node) => setEvents((e) => [...e, `Clicked: "${node.data.label ?? node.id}"`])}
      />
    </InteractiveWrapper>
  );
}

// ── Stories ───────────────────────────────────────────────────────────────

export const HoverHighlight: Story = {
  name: 'Hover highlight — path tracing',
  render: () => <HoverHighlightStory />,
};

export const Selection: Story = {
  name: 'Selection — click & marquee',
  render: () => <SelectionStory />,
};

export const SearchFilter: Story = {
  name: 'Search — live node filtering',
  render: () => <SearchWrapper />,
};

export const CollapseExpand: Story = {
  name: 'Collapse/Expand — subtree hiding',
  render: () => <CollapseWrapper />,
};

export const WithControls: Story = {
  name: 'Viewport controls — zoom & fit',
  args: {
    graph: workflowGraph,
    vertexComponent: DarkNode,
    showControls: true,
    fitViewOnMount: true,
    fitViewPadding: 48,
    config: {
      width: 960,
      height: 600,
      padding: 32,
      layout: LayoutType.Dag,
      curveEdges: true,
      curveStrength: 0.35,
      hoverHighlight: true,
      theme: { background: '#0d1117' },
    },
  },
};
