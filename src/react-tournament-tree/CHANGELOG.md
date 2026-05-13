## @graph-render/tournament-tree [1.3.0](https://github.com/oleksandr-zhynzher/graph-render/compare/@graph-render/tournament-tree@1.2.0...@graph-render/tournament-tree@1.3.0) (2026-05-13)

### 🚀 Features

- add slide mode with top carousel navigation ([d92aad3](https://github.com/oleksandr-zhynzher/graph-render/commit/d92aad360e286f1cf98a209d0fe4e56e9cf4c667))
- **bracket:** add compact mode for mobile/small screen brackets ([82fa212](https://github.com/oleksandr-zhynzher/graph-render/commit/82fa212df6b3f392c2920fec4486fb291cefe479))
- **bracket:** drastically reduce compact mode dimensions ([154ab9f](https://github.com/oleksandr-zhynzher/graph-render/commit/154ab9f80ddab06a211ae753c9bbd6af809d5909))
- **bracket:** make compact mode the default ([4a3c9a1](https://github.com/oleksandr-zhynzher/graph-render/commit/4a3c9a14fff27762766ec53ccbac0fdbd9c4e9c9))
- constrain viewport pan to bracket bounds (translateExtent) ([e007635](https://github.com/oleksandr-zhynzher/graph-render/commit/e0076352658d23a86cf010f5f5595f86edabb4dd))
- navigation mode on by default with compact stage pill nav ([7956bf8](https://github.com/oleksandr-zhynzher/graph-render/commit/7956bf89dd03de0f6725f7ab6a3298cc273c46b0))
- swipe navigation + hide stage labels in navigation mode ([a064025](https://github.com/oleksandr-zhynzher/graph-render/commit/a064025bdb803ba3aa71fc848f121a6817ab52d5))

### 🐛 Bug Fixes

- **bracket:** fix edge routing mismatch in compact mode ([1b8db77](https://github.com/oleksandr-zhynzher/graph-render/commit/1b8db77a7c6d14131ee2bf710726d55045af9121))
- **bracket:** fix SVG compact layout — badge, scores, and fonts no longer overlap player names ([b55d76b](https://github.com/oleksandr-zhynzher/graph-render/commit/b55d76be3aff5477c56c18a169a5e0cf38ea0ce6))
- **bracket:** force compact node sizes, fixing edge routing mismatch ([b0a304d](https://github.com/oleksandr-zhynzher/graph-render/commit/b0a304dfb28cae166aba8fe5201b3c3c4b4a07c6))
- reduce edge stroke width from 2 to 1 ([669f501](https://github.com/oleksandr-zhynzher/graph-render/commit/669f5013cd916d2dd2048487b837716c6988dbd1))
- reduce node card border radius to 8px in compact mode ([70fc92f](https://github.com/oleksandr-zhynzher/graph-render/commit/70fc92f37d14a3c199b30d8bfe97f4a57c941a4a))
- svg text alignment, nodeGap, and storybook aliases ([e1c4c58](https://github.com/oleksandr-zhynzher/graph-render/commit/e1c4c5802f9c90ee0c3f07d23a3aad680dc14cb3))
- use bracket-style edge routing to fix broken edges in compact mode ([2e196e4](https://github.com/oleksandr-zhynzher/graph-render/commit/2e196e4cc6718ce5d1a31d3b84943b1baed1179e))

### Dependencies

- **@graph-render/react:** upgraded to 1.3.0
- **@graph-render/types:** upgraded to 1.1.0

## @graph-render/tournament-tree [1.2.1](https://github.com/oleksandr-zhynzher/graph-render/compare/@graph-render/tournament-tree@1.2.0...@graph-render/tournament-tree@1.2.1) (2026-05-13)

### 🐛 Bug Fixes

- svg text vertical alignment using dy="0.35em" for cross-browser support ([e1c4c58](https://github.com/oleksandr-zhynzher/graph-render/commit/e1c4c5802f9c90ee0c3f07d23a3aad680dc14cb3))
- set nodeGap to 10px in default tournament configs ([e1c4c58](https://github.com/oleksandr-zhynzher/graph-render/commit/e1c4c5802f9c90ee0c3f07d23a3aad680dc14cb3))

## @graph-render/tournament-tree [1.2.0](https://github.com/oleksandr-zhynzher/graph-render/compare/@graph-render/tournament-tree@1.1.0...@graph-render/tournament-tree@1.2.0) (2026-05-12)

### 🚀 Features

- **tournament-tree:** add onMatchClick event and storybook output panel ([7dec469](https://github.com/oleksandr-zhynzher/graph-render/commit/7dec469fc71dc77dd0943bd3b70781bf23f4459c))

## @graph-render/tournament-tree [1.1.0](https://github.com/oleksandr-zhynzher/graph-render/compare/@graph-render/tournament-tree@1.0.4...@graph-render/tournament-tree@1.1.0) (2026-05-10)

### 🚀 Features

- detect dark theme ([#8](https://github.com/oleksandr-zhynzher/graph-render/issues/8)) ([f882cc0](https://github.com/oleksandr-zhynzher/graph-render/commit/f882cc071a5f24804c4fc06f2b5ab7c948f06ef4))

### Dependencies

- **@graph-render/react:** upgraded to 1.2.0

## @graph-render/tournament-tree [1.0.4](https://github.com/oleksandr-zhynzher/graph-render/compare/@graph-render/tournament-tree@1.0.3...@graph-render/tournament-tree@1.0.4) (2026-05-09)

### 🐛 Bug Fixes

- **deps:** use wildcard version for Yarn 1 compatibility ([56bcdf4](https://github.com/oleksandr-zhynzher/graph-render/commit/56bcdf4a2eb2e906f4724ed03ac90114661d2cb6))
- **deps:** use workspace protocol for internal dependencies ([189789b](https://github.com/oleksandr-zhynzher/graph-render/commit/189789bfbbf790de62f715fa59a0a54b773cd118))

### Dependencies

- **@graph-render/react:** upgraded to 1.1.0

## @graph-render/tournament-tree [1.0.3](https://github.com/oleksandr-zhynzher/graph-render/compare/@graph-render/tournament-tree@1.0.2...@graph-render/tournament-tree@1.0.3) (2026-05-09)

### Dependencies

- **@graph-render/react:** upgraded to 1.0.3

## @graph-render/tournament-tree [1.0.2](https://github.com/oleksandr-zhynzher/graph-render/compare/@graph-render/tournament-tree@1.0.1...@graph-render/tournament-tree@1.0.2) (2026-03-27)

### Dependencies

- **@graph-render/react:** upgraded to 1.0.2
- **@graph-render/types:** upgraded to 1.0.2

## @graph-render/tournament-tree [1.0.1](https://github.com/oleksandr-zhynzher/graph-render/compare/@graph-render/tournament-tree@1.0.0...@graph-render/tournament-tree@1.0.1) (2026-03-19)

### Dependencies

- **@graph-render/react:** upgraded to 1.0.1
- **@graph-render/types:** upgraded to 1.0.1

## @graph-render/tournament-tree 1.0.0 (2026-03-17)

### 🚀 Features

- **tournament:** add export and server SVG render modes ([cc08800](https://github.com/oleksandr-zhynzher/graph-render/commit/cc088004ec39909d031a16c1436cdd4a0af24849))
- **tournament:** comprehensive UI polish – white cards, winner accent, circular avatars, refined edges ([9e05a47](https://github.com/oleksandr-zhynzher/graph-render/commit/9e05a4789466be092f3d4436a19e3f14b69038d4))

### 🐛 Bug Fixes

- **path:** remove tournament 'players' domain leak from generic path utility ([b4f24fe](https://github.com/oleksandr-zhynzher/graph-render/commit/b4f24fe603db24a0f80dce0336b1c89e50ad8f6d))

### Dependencies

- **@graph-render/react:** upgraded to 1.0.0
