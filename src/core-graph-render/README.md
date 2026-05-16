# @graph-render/core

Core graph rendering logic and algorithms for visualizing graphs and trees.

## Installation

```bash
npm install @graph-render/core
# or
yarn add @graph-render/core
```

## Features

- Multiple layout algorithms (DAG, tree, force-directed, radial, grid, orthogonal flow)
- Edge routing with collision detection
- Customizable rendering options
- SVG rendering support
- TypeScript support

## Usage

```typescript
import { renderGraphToSvg } from '@graph-render/core';

const graph = {
  nodes: [
    { id: '1', label: 'Node 1' },
    { id: '2', label: 'Node 2' },
  ],
  edges: [{ source: '1', target: '2' }],
};

const { svg } = renderGraphToSvg(graph, {
  layout: 'dag',
  width: 800,
  height: 600,
});
```

## License

MIT
