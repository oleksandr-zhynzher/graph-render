# @graph-render/tournament-tree

[![npm](https://img.shields.io/npm/v/@graph-render/tournament-tree.svg)](https://www.npmjs.com/package/@graph-render/tournament-tree)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/oleksandr-zhynzher/graph-render/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6.svg)](https://www.typescriptlang.org/)

**A complete tournament bracket component for React.**

Drop in `<TournamentBracket>`, pass your match data, and get a fully interactive bracket — with match cards, scores, winners, round labels, stage navigation, dark mode, mobile-friendly zoom, and SVG export — all styled and ready to use.

## Install

```bash
yarn add @graph-render/tournament-tree react react-dom
```

## Quick Start

```tsx
import { MatchStatus, TournamentBracket } from '@graph-render/tournament-tree';

const graph = {
  nodes: {
    sf1: {
      meta: {
        players: [
          { name: 'Paul Coll', seed: 1 },
          { name: 'Mohamed ElShorbagy', seed: 4 },
        ],
        sets: [
          [11, 9],
          [9, 11],
          [11, 7],
        ],
        status: MatchStatus.Completed,
      },
    },
    sf2: {
      meta: {
        players: [
          { name: 'Ali Farag', seed: 2 },
          { name: 'Tarek Momen', seed: 3 },
        ],
        sets: [
          [11, 8],
          [11, 6],
        ],
        status: MatchStatus.Completed,
      },
    },
    final: {
      meta: {
        players: [
          { name: 'Paul Coll', seed: 1 },
          { name: 'Ali Farag', seed: 2 },
        ],
        status: MatchStatus.Upcoming,
      },
    },
  },
  adj: {
    sf1: { final: { id: 'sf1-final', type: 'undirected' } },
    sf2: { final: { id: 'sf2-final', type: 'undirected' } },
    final: {},
  },
};

export default function App() {
  return (
    <TournamentBracket
      graph={graph}
      title="World Championship"
      defaultNavigationMode
      onMatchClick={(match) => console.log(match)}
    />
  );
}
```

## Features

- **Match cards** — player badges, set scores, winners, live indicators, and upcoming state
- **Auto round labels** — generated from the bracket shape, no manual configuration needed
- **Stage navigation** — swipe or tap through rounds on mobile; keyboard-friendly on desktop
- **Close-up mobile zoom** — stage navigation zooms in to fill the screen with just the current round
- **Dark mode** — built-in light and dark themes, toggleable via toolbar
- **SVG export** — export the entire bracket as a crisp SVG file
- **Live matches** — highlight the winning score and show a live indicator in real time
- **Fully typed** — every prop, match status, and data shape has a TypeScript type

## Match Status

```tsx
import { MatchStatus } from '@graph-render/tournament-tree';

// MatchStatus.Completed  — match is finished, winner highlighted
// MatchStatus.Live       — shows live indicator and scores in progress
// MatchStatus.Upcoming   — dimmed state, no scores shown
```

## Bracket Shape

Connect matches through `adj` to model any bracket structure. The component infers round labels and layout from the graph shape automatically.

```ts
const graph = {
  nodes: {
    qf1: { meta: qf1Meta },
    qf2: { meta: qf2Meta },
    qf3: { meta: qf3Meta },
    qf4: { meta: qf4Meta },
    sf1: { meta: sf1Meta },
    sf2: { meta: sf2Meta },
    final: { meta: finalMeta },
  },
  adj: {
    qf1: { sf1: { id: 'qf1-sf1', type: 'undirected' } },
    qf2: { sf1: { id: 'qf2-sf1', type: 'undirected' } },
    qf3: { sf2: { id: 'qf3-sf2', type: 'undirected' } },
    qf4: { sf2: { id: 'qf4-sf2', type: 'undirected' } },
    sf1: { final: { id: 'sf1-final', type: 'undirected' } },
    sf2: { final: { id: 'sf2-final', type: 'undirected' } },
    final: {},
  },
};
```

## Props

| Prop                    | Type                   | Default                | Description                                 |
| ----------------------- | ---------------------- | ---------------------- | ------------------------------------------- |
| `graph`                 | `NxGraphInput`         | required               | Graph data with match metadata on each node |
| `title`                 | `string`               | `'Tournament Bracket'` | Bracket header title                        |
| `badgeText`             | `string`               | auto                   | Short label shown in the header badge       |
| `compact`               | `boolean`              | `true`                 | Use compact match card sizing               |
| `defaultNavigationMode` | `boolean`              | `true`                 | Start in stage navigation mode              |
| `showToolbar`           | `boolean`              | `true`                 | Show the floating toolbar                   |
| `nodeRenderMode`        | `SquashNodeRenderMode` | `'export'`             | Rendering mode for match cards              |
| `onMatchClick`          | `(node) => void`       | —                      | Callback when a match card is clicked       |
| `onInvalidNode`         | `(id, err) => void`    | —                      | Callback for nodes that fail to render      |

## Match Data Shape

```ts
interface SquashMatchMeta {
  players?: Array<{
    name: string;
    seed?: number;
    country?: string;
  }>;
  sets?: number[][]; // e.g. [[11, 8], [9, 11], [11, 7]]
  tiebreaks?: number[][]; // tiebreak scores per set
  status?: MatchStatus; // 'completed' | 'live' | 'upcoming'
  currentSet?: number; // set index currently being played (live only)
  stage?: string; // optional stage label
}
```

## Custom Node Renderer

Replace the built-in match card with your own component:

```tsx
import { TournamentBracket } from '@graph-render/tournament-tree';
import type { VertexComponentProps } from '@graph-render/types';

function MyMatchCard({ node }: VertexComponentProps) {
  const meta = node.meta as SquashMatchMeta;
  return (
    <foreignObject width={node.size?.width} height={node.size?.height}>
      <div className="my-match-card">
        {meta.players?.[0]?.name} vs {meta.players?.[1]?.name}
      </div>
    </foreignObject>
  );
}

<TournamentBracket graph={graph} vertexComponent={MyMatchCard} />;
```

## License

MIT — free for personal and commercial use. See [LICENSE](https://github.com/oleksandr-zhynzher/graph-render/blob/main/LICENSE).
