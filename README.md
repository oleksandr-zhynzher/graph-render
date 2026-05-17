# Graph Render

[![Release](https://github.com/oleksandr-zhynzher/graph-render/actions/workflows/release.yml/badge.svg)](https://github.com/oleksandr-zhynzher/graph-render/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)

**Render interactive graphs and tournament brackets in React.**

Graph Render gives you a composable set of packages — from a framework-agnostic layout engine to a full squash tournament bracket component — all fully typed in TypeScript and ready to drop into any React app.

---

## What You Can Build

- **Tournament brackets** with round labels, live scores, stage navigation, and mobile-friendly zoom
- **Dependency graphs**, DAGs, and trees with interactive pan, zoom, and selection
- **Custom graph UIs** using your own React node components plugged into a layout engine

---

## Packages

| Package                                                      | Version                                                                                                                               | Description                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| [`@graph-render/tournament-tree`](src/react-tournament-tree) | [![npm](https://img.shields.io/npm/v/@graph-render/tournament-tree.svg)](https://www.npmjs.com/package/@graph-render/tournament-tree) | Ready-made tournament bracket UI for React   |
| [`@graph-render/react`](src/react-graph-render)              | [![npm](https://img.shields.io/npm/v/@graph-render/react.svg)](https://www.npmjs.com/package/@graph-render/react)                     | Interactive graph canvas for React           |
| [`@graph-render/core`](src/core-graph-render)                | [![npm](https://img.shields.io/npm/v/@graph-render/core.svg)](https://www.npmjs.com/package/@graph-render/core)                       | Framework-agnostic layout and routing engine |
| [`@graph-render/types`](src/types)                           | [![npm](https://img.shields.io/npm/v/@graph-render/types.svg)](https://www.npmjs.com/package/@graph-render/types)                     | Shared TypeScript types for all packages     |

---

## Tournament Bracket in 30 Seconds

```bash
yarn add @graph-render/tournament-tree react react-dom
```

```tsx
import { MatchStatus, TournamentBracket } from '@graph-render/tournament-tree';

const graph = {
  nodes: {
    qf1: {
      meta: {
        players: [
          { name: 'Paul Coll', seed: 1 },
          { name: 'Richie Fallows', seed: 8 },
        ],
        sets: [
          [11, 5],
          [11, 7],
        ],
        status: MatchStatus.Completed,
      },
    },
  },
  adj: { qf1: {} },
};

export default function App() {
  return <TournamentBracket graph={graph} title="Open Championship" />;
}
```

That's it. You get match cards, winner highlighting, round labels, stage navigation, dark mode, and SVG export out of the box.

To customize colors, fonts, match-card size, and chrome, pass an `appearance` object — see [Styling & configuration](src/react-tournament-tree/README.md#styling--configuration) in the tournament-tree package README.

---

## Interactive Graph Canvas

```bash
yarn add @graph-render/react react react-dom
```

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
        height: 500,
      }}
    />
  );
}
```

---

## Highlights

- **Zero config to start** — sane defaults for layout, zoom, and sizing
- **Fully typed** — every prop, event, and data shape has a TypeScript type
- **Themeable brackets** — `appearance` prop for colors, typography, match cards, header, and frame
- **Custom node renderers** — replace any node with your own React component
- **Stage navigation** — mobile-first round-by-round swiping for tournament brackets
- **Dark mode** — built-in light/dark theme for all components
- **SVG export** — render any graph to a static SVG file
- **React 19** — requires React 19 as a peer dependency

---

## Try It Live

**Hosted Storybook:** [Bracket & graph demos](https://oleksandr-zhynzher.github.io/graph-render/?path=/docs/bracket-squash-tournament--docs)

To run demos locally:

```bash
git clone https://github.com/oleksandr-zhynzher/graph-render.git
cd graph-render
yarn install && yarn storybook
```

Then open [http://localhost:6006](http://localhost:6006).

---

## Releases & packages

On every push to `main` or `master` (with a [Conventional Commit](https://www.conventionalcommits.org/) that triggers a release):

- **GitHub Releases** — one release per published package (`@graph-render/types`, `core`, `react`, `tournament-tree`)
- **npm** — published to [npmjs.com](https://www.npmjs.com/org/graph-render) when `NPM_TOKEN` is configured in repo secrets
- **GitHub Packages** — the same versions under `@graph-render/*` on `https://npm.pkg.github.com`

Published packages:

| Package                         | Description               |
| ------------------------------- | ------------------------- |
| `@graph-render/types`           | Shared TypeScript types   |
| `@graph-render/core`            | Layout and routing engine |
| `@graph-render/react`           | Interactive graph canvas  |
| `@graph-render/tournament-tree` | Tournament bracket UI     |

Install from GitHub Packages:

```bash
# ~/.npmrc
@graph-render:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

```bash
yarn add @graph-render/tournament-tree
```

To backfill packages without a new release, run the **Publish GitHub Packages** workflow under Actions.

Storybook is deployed to GitHub Pages on the same branches via the **Deploy Storybook** workflow.

---

## License

MIT — free for personal and commercial use.
