# @graph-render/react

<p>
  <a href="https://www.npmjs.com/package/@graph-render/react"><img src="https://img.shields.io/npm/v/@graph-render/react" alt="npm version" /></a>
  <a href="https://github.com/graph-render/graph-render/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61dafb" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-ready-3178c6" alt="TypeScript" /></a>
</p>

**Interactive graph canvas for React.**

Render dependency graphs, DAGs, trees, and any custom graph with pan, zoom, selection, search, and your own React node components.

## Install

```bash
yarn add @graph-render/react react react-dom
```

## Quick Start

```tsx
import { Graph } from '@graph-render/react';
import { EdgeType, LayoutType } from '@graph-render/types';

const graph = {
  nodes: {
    api: { label: 'API' },
    db: { label: 'Database' },
    cache: { label: 'Cache' },
  },
  adj: {
    api: {
      db: { id: 'api-db', type: 'directed' },
      cache: { id: 'api-cache', type: 'directed' },
    },
    db: {},
    cache: {},
  },
};

export default function App() {
  return (
    <Graph
      graph={graph}
      config={{
        layout: LayoutType.Tree,
        defaultEdgeType: EdgeType.Directed,
        width: 900,
        height: 520,
      }}
    />
  );
}
```

## Custom Nodes

Pass any React component as `vertexComponent` to render your own node UI:

```tsx
import type { VertexComponentProps } from '@graph-render/types';

function ServiceNode({ node }: VertexComponentProps) {
  return (
    <foreignObject width={node.size?.width ?? 160} height={node.size?.height ?? 64}>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          borderRadius: 10,
          background: '#0f172a',
          color: '#e2e8f0',
          fontWeight: 600,
        }}
      >
        {node.label}
      </div>
    </foreignObject>
  );
}

<Graph graph={graph} vertexComponent={ServiceNode} />;
```

## Features

- Tree, DAG, grid, radial, centered, force-directed, compact bracket, and orthogonal flow layouts
- Pan, zoom, fit view, and translate bounds
- Node and edge selection
- Search with match highlighting and unmatched-node hiding
- Hover callbacks for nodes and edges
- Collapsible subtrees
- Custom React node components
- Viewport control via imperative ref handle
- SVG export support through `@graph-render/core`
- React 19 required

## Layout Options

```ts
import { LayoutType, LayoutDirection } from '@graph-render/types';

// LayoutType.Tree           — hierarchical tree
// LayoutType.Dag            — layered DAG
// LayoutType.Grid           — uniform grid
// LayoutType.Radial         — radial tree
// LayoutType.Centered       — centered hub
// LayoutType.ForceDirected  — physics simulation
// LayoutType.CompactBracket — tight tournament bracket
// LayoutType.OrthogonalFlow — top-down flow diagram

// LayoutDirection.LTR — left to right
// LayoutDirection.RTL — right to left
```

## License

MIT — free for personal and commercial use. See [LICENSE](https://github.com/graph-render/graph-render/blob/main/LICENSE).
