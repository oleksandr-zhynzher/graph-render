# @graph-render/react

React components for interactive graph visualization.

## Installation

```bash
npm install @graph-render/react @graph-render/core
# or
yarn add @graph-render/react @graph-render/core
```

## Features

- React components for graph rendering
- Built-in graph interaction hooks (hover, collapse, search)
- Customizable node and edge rendering
- Viewport management
- TypeScript support
- Full SSR support

## Usage

```tsx
import { Graph } from '@graph-render/react';

function MyGraph() {
  const graph = {
    nodes: [
      { id: '1', label: 'Node 1' },
      { id: '2', label: 'Node 2' }
    ],
    edges: [
      { source: '1', target: '2' }
    ]
  };

  return (
    <Graph
      graph={graph}
      layout="dag"
      width={800}
      height={600}
    />
  );
}
```

## API

### Graph Component

Main component for rendering graphs.

**Props:**
- `graph` - Graph data structure
- `layout` - Layout algorithm ('dag', 'tree', 'force', 'radial', 'grid')
- `width` - Canvas width
- `height` - Canvas height
- `nodeRenderer` - Custom node renderer (optional)
- `edgeRenderer` - Custom edge renderer (optional)

### Hooks

- `useGraphModel` - Graph data management
- `useGraphViewState` - Viewport state
- `useGraphHover` - Hover interaction
- `useGraphCollapse` - Node collapse/expand
- `useGraphSearchState` - Search functionality

## License

MIT
