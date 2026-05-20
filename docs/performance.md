# Performance Guidelines

Graph rendering performance is part of the public contract.

## Required practices

1. Keep layout and routing memoization independent from telemetry callback identity.
2. Use maps/sets for repeated node and edge lookups.
3. Keep pointer, hover, wheel, and keyboard handlers referentially stable where possible.
4. Prefer refs for transient gesture state that does not need to render.
5. Culling may over-render, but must never remove edges or nodes that are visible.
6. Avoid spreading large graph arrays into variadic functions such as `Math.min` and `Math.max`.

## Benchmark targets

Performance-sensitive changes should be evaluated with small, medium, and large graph fixtures covering layout, routing, initial render, pan/zoom, hover, selection, and export.
