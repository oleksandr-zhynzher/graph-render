# @graph-render/types

<p>
  <a href="https://www.npmjs.com/package/@graph-render/types"><img src="https://img.shields.io/npm/v/@graph-render/types" alt="npm version" /></a>
  <a href="https://github.com/graph-render/graph-render/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-ready-3178c6" alt="TypeScript" /></a>
</p>

**Shared TypeScript types for Graph Render packages.**

Import these types in your application code, custom node renderers, or integrations to stay in sync with the types used internally by all Graph Render packages.

## Install

```bash
yarn add @graph-render/types
```

## What Is Included

- `NxGraphInput` — the graph data format accepted by all Graph Render components
- `GraphConfig`, `GraphViewport`, `GraphTheme` — layout and rendering configuration
- `PositionedNode`, `PositionedEdge` — post-layout node and edge shapes
- `VertexComponent`, `VertexComponentProps` — custom React node renderer contracts
- `SquashMatchMeta`, `SquashPlayer`, `SquashPositionedNode` — tournament data types
- `StageView`, `StageBounds`, `StageViewportResult` — stage navigation types
- `LayoutType`, `LayoutDirection`, `EdgeType`, `MatchStatus`, and more enums

## Example

```ts
import {
  EdgeType,
  LayoutType,
  MatchStatus,
  type NxGraphInput,
  type SquashMatchMeta,
} from '@graph-render/types';

const match: SquashMatchMeta = {
  players: [
    { name: 'Paul Coll', seed: 1 },
    { name: 'Ali Farag', seed: 2 },
  ],
  sets: [
    [11, 8],
    [9, 11],
    [11, 7],
  ],
  status: MatchStatus.Completed,
};
```

## License

MIT — free for personal and commercial use. See [LICENSE](https://github.com/graph-render/graph-render/blob/main/LICENSE).
