# Public API Policy

The public API is every export reachable from package `exports` fields and root entrypoints.

## API rules

1. Prefer grouped option objects over new flat boolean props.
2. Keep generic graph APIs independent from tournament-specific concepts; domain contracts must use explicit subpaths.
3. Do not export internal utilities from package roots unless they are intentionally supported.
4. Add tests for new public behavior before release.
5. Treat type-only exports as semver-relevant for TypeScript consumers.

## Deprecation rules

Deprecated APIs must include migration guidance and remain covered by tests until removed in a major version. New APIs should be introduced beside deprecated APIs before removal.

## Package-boundary checks

Build output should preserve internal package dependencies as external imports. Subpath imports such as `@graph-render/types/react` must not be bundled into downstream package builds.

CI must run `yarn smoke:exports` after `yarn build` to import every built package entrypoint. This keeps package `exports` maps, declaration output, and runtime entrypoints aligned.

React package roots are explicitly client-only. New server-safe APIs belong in `@graph-render/core` or `@graph-render/types`, not in the React package roots.

For React components, new capabilities must be added to grouped option objects first. Existing flat props are compatibility shims and must not be used as the model for new API expansion.
