# Architecture

`graph-render` is a layered monorepo. Package dependencies must only point down the stack:

```text
@graph-render/tournament-tree -> @graph-render/react -> @graph-render/core -> @graph-render/types
```

No lower layer may import a higher layer. Shared packages must not depend on product-specific UI domains.

## Package responsibilities

| Package                         | Responsibility                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `@graph-render/types`           | Generic graph contracts plus explicit domain subpaths such as `@graph-render/types/tournament`.               |
| `@graph-render/core`            | Framework-independent graph validation, normalization, layout, routing, and SVG rendering primitives.         |
| `@graph-render/react`           | Interactive React graph canvas, viewport/selection/hover/keyboard/pointer behavior, and React component APIs. |
| `@graph-render/tournament-tree` | Tournament-specific graph adaptation, match-card UI, stage navigation, and export behavior.                   |

## Boundary rules

1. Generic graph types stay on the root `@graph-render/types` entrypoint.
2. Product-specific reusable contracts must use explicit domain subpaths such as `@graph-render/types/tournament`.
3. Core algorithms must stay React-free.
4. React runtime code may depend on core algorithms, but core must not depend on React.
5. Published package entrypoints must expose deliberate public APIs only.

## Runtime design rules

High-frequency graph interactions must use stable handlers and refs for transient state. Expensive model work such as layout and routing must not depend on consumer callback identity. Viewport culling must be correctness-preserving: optimization may over-render, but it must not hide visible graph relationships.

React package entrypoints are client-only. `@graph-render/react` and `@graph-render/tournament-tree` export hooks and interactive components and must be imported from client components in RSC frameworks such as Next.js App Router. Keep `@graph-render/core` and `@graph-render/types` as the server-safe packages for parsing, layout, routing, SVG rendering, and type contracts.

Recoverable graph model errors must be collected during pure model computation and emitted after commit. Layout and routing helpers must not call consumer callbacks during render.

Tournament UI theme state is owned through explicit props (`theme`, `isDarkMode`, `defaultDarkMode`, and `onDarkModeChange`) rather than mandatory document probing. Export failures throw `SvgExportError` and may be observed with `onExportError`.
