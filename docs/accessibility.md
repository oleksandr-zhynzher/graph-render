# Accessibility Guidelines

Interactive graph controls must expose accurate semantics.

## Graph canvas

The SVG canvas should provide an accessible name and instructions for keyboard behavior. Keyboard shortcuts must stop propagation only when the graph handles them.

## Nodes and edges

Nodes and edges may be clickable without being selectable. Selection state must only be exposed when selection is enabled. Use `aria-pressed` only for toggle-like behavior; otherwise omit it or use a more appropriate collection pattern such as `aria-selected`.

## Tournament UI

Toolbar and navigation buttons must have clear accessible names. Theme and navigation mode changes should be understandable without relying on color alone.
