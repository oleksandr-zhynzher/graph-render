# Security Policy

## Supported versions

Security fixes are applied to the latest release on npm for each `@graph-render/*` package.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security-sensitive reports.

Use GitHub private vulnerability reporting for this repository:

https://github.com/graph-render/graph-render/security/advisories/new

Include:

- A description of the issue and impact
- Steps to reproduce
- Affected package versions
- Any suggested mitigation

We aim to acknowledge reports within a few business days and will coordinate disclosure after a fix is available.

## Scope notes

Graph Render renders user-supplied graph data in SVG/DOM. Consumers are responsible for sanitizing untrusted labels and metadata before passing them into graph nodes. The library does not execute arbitrary HTML from graph props unless a consumer supplies a custom `vertexComponent` that does so.
