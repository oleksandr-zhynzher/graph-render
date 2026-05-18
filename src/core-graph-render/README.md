# @graph-render/core

<p>
  <a href="https://www.npmjs.com/package/@graph-render/core"><img src="https://img.shields.io/npm/v/@graph-render/core" alt="npm version" /></a>
  <a href="https://github.com/graph-render/graph-render/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-ready-3178c6" alt="TypeScript" /></a>
</p>

**Framework-agnostic graph layout and SVG rendering.**

Use `@graph-render/core` when you need graph layout, edge routing, or static SVG output — without React in the dependency chain. Works in Node.js, server-side rendering pipelines, CLI tools, and any JS runtime.

## Install

```bash
yarn add @graph-render/core
```

## Render a Graph to SVG

```ts
import { renderGraphToSvg } from '@graph-render/core';
import { EdgeType, LayoutType } from '@graph-render/types';

const { svg } = renderGraphToSvg(
  {
    nodes: {
      a: { label: 'Build' },
      b: { label: 'Test' },
      c: { label: 'Deploy' },
    },
    adj: {
      a: { b: { id: 'a-b', type: 'directed' } },
      b: { c: { id: 'b-c', type: 'directed' } },
      c: {},
    },
  },
  {
    title: 'CI Pipeline',
    layout: LayoutType.Tree,
    defaultEdgeType: EdgeType.Directed,
    width: 900,
    height: 400,
  }
);

// svg is a complete <svg> document string
```

## Layout Nodes Programmatically

```ts
import { fromNxGraph, layoutNodes } from '@graph-render/core';
import { LayoutType } from '@graph-render/types';

const { nodes, edges } = fromNxGraph(graph, 'directed');
const positioned = layoutNodes({ nodes, edges, layout: LayoutType.Tree, width: 900, height: 520 });

// positioned[0].position → { x: number, y: number }
// positioned[0].size     → { width: number, height: number }
```

## Features

- Multiple layout algorithms: tree, DAG, grid, radial, centered, compact bracket, force-directed, orthogonal flow
- Smart, orthogonal, and bundled edge routing
- SVG document output with optional custom node and edge renderers
- Directed and undirected graph support
- No React dependency — use anywhere TypeScript or JavaScript runs

## License

MIT — free for personal and commercial use. See [LICENSE](https://github.com/graph-render/graph-render/blob/main/LICENSE).
