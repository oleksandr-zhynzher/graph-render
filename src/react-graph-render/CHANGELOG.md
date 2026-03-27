## @graph-render/react [1.0.2](https://github.com/oleksandr-zhynzher/graph-render/compare/@graph-render/react@1.0.1...@graph-render/react@1.0.2) (2026-03-27)

### 🐛 Bug Fixes

* **core:** make failure and validation policies explicit ([9236ba2](https://github.com/oleksandr-zhynzher/graph-render/commit/9236ba2bd01d571e08ce2f80d941abdf3115f8b0))


### Dependencies

* **@graph-render/core:** upgraded to 1.0.2
* **@graph-render/types:** upgraded to 1.0.2

## @graph-render/react [1.0.1](https://github.com/oleksandr-zhynzher/graph-render/compare/@graph-render/react@1.0.0...@graph-render/react@1.0.1) (2026-03-19)

### 🐛 Bug Fixes

* **core:** harden config normalization and stability ([983e372](https://github.com/oleksandr-zhynzher/graph-render/commit/983e372b767f20c12f220ca2206eac87ab31887c))
* **labels:** cap label work and render multiline defaults ([395c444](https://github.com/oleksandr-zhynzher/graph-render/commit/395c44417df8d9476023090668596f3ec0e68fcc))
* **react:** avoid rendering stale graph state after failures ([9953bf4](https://github.com/oleksandr-zhynzher/graph-render/commit/9953bf4a4c27066fc2c6a45be452d0b3081e34cb))
* **react:** fall back when SVG node measurement is unavailable ([74a5921](https://github.com/oleksandr-zhynzher/graph-render/commit/74a59216ede3708870d407ecc17a1ea55997d507))
* **react:** handle async node expansion deterministically ([4c80feb](https://github.com/oleksandr-zhynzher/graph-render/commit/4c80febfb2032e17f304b7bf4fa8429976a057de))

### ♻️ Code Refactoring

* **react:** isolate collapse state management ([276360a](https://github.com/oleksandr-zhynzher/graph-render/commit/276360a6e0f420fc6342b04e62c474f62e938ce1))


### Dependencies

* **@graph-render/core:** upgraded to 1.0.1
* **@graph-render/types:** upgraded to 1.0.1

## @graph-render/react 1.0.0 (2026-03-17)

### 🚀 Features

* **core:** add node measurement and auto sizing ([721a082](https://github.com/oleksandr-zhynzher/graph-render/commit/721a08206bf26b979f0e5de9e97cfcc34d562e1f))
* **core:** improve edge routing and labels ([273bdcb](https://github.com/oleksandr-zhynzher/graph-render/commit/273bdcb4e30f47a2d9bd75428739ee03ff5cea10))
* **graph:** pan viewport to follow node focused via arrow-key navigation ([c20edab](https://github.com/oleksandr-zhynzher/graph-render/commit/c20edab3fcf0904349f55a2c11fa7e32d92bdee0))
* **react:** add marquee selection and focus navigation ([be7bf1a](https://github.com/oleksandr-zhynzher/graph-render/commit/be7bf1acc8442dd36c0d92f1a97fe13e9f368596))
* **react:** add search filter and highlight APIs ([5881c82](https://github.com/oleksandr-zhynzher/graph-render/commit/5881c8239776835210f153f54f053f40195effe3))
* **react:** add subtree collapse and filtered graph view ([95e8d64](https://github.com/oleksandr-zhynzher/graph-render/commit/95e8d641db4584fb4d749b9f0bb7b0d80b613b9b))
* **react:** add viewport controls and touch zoom ([ac9f02f](https://github.com/oleksandr-zhynzher/graph-render/commit/ac9f02f3bfbfc1fe58fb10231600f38721b3d7b3))
* **tournament:** comprehensive UI polish – white cards, winner accent, circular avatars, refined edges ([9e05a47](https://github.com/oleksandr-zhynzher/graph-render/commit/9e05a4789466be092f3d4436a19e3f14b69038d4))

### 🐛 Bug Fixes

* **graph:** drag cursor never displayed 'grabbing' ([0153fdb](https://github.com/oleksandr-zhynzher/graph-render/commit/0153fdbedf07189b3df766e1640b9ac8bfea238d))
* **graph:** marquee selection misses labeled edges whose path is inside the box ([f0b038e](https://github.com/oleksandr-zhynzher/graph-render/commit/f0b038e9f19b60c1bc5660ae5e560de755ad88c9))
* **graph:** prevent full model recompute when config is an inline object ([27e2fa4](https://github.com/oleksandr-zhynzher/graph-render/commit/27e2fa40da3faa6e8a186963a74128700b82f17f))
* **graph:** resolve stale-closure bug in updateViewport ([ef9bf63](https://github.com/oleksandr-zhynzher/graph-render/commit/ef9bf63fc03e97c595a2455e3981cb2db5e6a369))
* **hover:** directed-edge hover incorrectly marked source node as 'in' ([b7777c9](https://github.com/oleksandr-zhynzher/graph-render/commit/b7777c94c42f508c1b25bd2a77221ae1a9c39609))
* **labels:** eliminate hardcoded colors and two sources of truth in GraphLabels ([4becf71](https://github.com/oleksandr-zhynzher/graph-render/commit/4becf71d6125740e994546c1054e021166ce74d0)), closes [#eef1f6](https://github.com/oleksandr-zhynzher/graph-render/issues/eef1f6) [#d7dbe3](https://github.com/oleksandr-zhynzher/graph-render/issues/d7dbe3) [#3f434b](https://github.com/oleksandr-zhynzher/graph-render/issues/3f434b)
* **labels:** guard column Map against floating-point position artifacts ([5a9991a](https://github.com/oleksandr-zhynzher/graph-render/commit/5a9991ac12d50e3218764431ba9f4c073ea39fb1))
* **path:** guard traverseHighlightedPath against unbounded traversal ([256a89f](https://github.com/oleksandr-zhynzher/graph-render/commit/256a89f05e0a2e0d385fde10ccf2cafb69d47536))
* **path:** remove tournament 'players' domain leak from generic path utility ([b4f24fe](https://github.com/oleksandr-zhynzher/graph-render/commit/b4f24fe603db24a0f80dce0336b1c89e50ad8f6d))
* **search:** prevent infinite re-render loop from onSearchResultsChange ([3e826f7](https://github.com/oleksandr-zhynzher/graph-render/commit/3e826f721b24903c2e1f7fa5dc6e87d1cb4f92e9))
* **types:** remove duplicate PathTraversalResult definition in pathHighlight.ts ([00360fe](https://github.com/oleksandr-zhynzher/graph-render/commit/00360fe687152ce1991c5265041d3dc072b601f9))
* **types:** use Partial<Pick<...>> for intentionally-absent fields in DEFAULT_CONFIG ([64d027f](https://github.com/oleksandr-zhynzher/graph-render/commit/64d027f076a380a6bc5b748a97df39c932d3c068))

### ⚡ Performance Improvements

* **graph:** remove superfluous useMemo around primitive string expressions ([4804e6e](https://github.com/oleksandr-zhynzher/graph-render/commit/4804e6e387156325e47c4d8e869dcc348b8f65ea))
* **graph:** use O(n) scan instead of O(n log n) sort in getNearestNodeInDirection ([c1d459d](https://github.com/oleksandr-zhynzher/graph-render/commit/c1d459dcea5afeecadc29a921eff52a55f77b4cb))
* **graph:** wrap EdgePath with React.memo to skip re-render of unchanged edges ([7b2a801](https://github.com/oleksandr-zhynzher/graph-render/commit/7b2a801cb57208c08e4c5e4561c2f3520d537b18))
* **search:** share outgoing adjacency map between descendant traversal and childNodeIdsByParent ([110e1d9](https://github.com/oleksandr-zhynzher/graph-render/commit/110e1d910f61ad14633e39cc6ffbb7ccd5b188c9))

### ♻️ Code Refactoring

* **graph:** eliminate magic numbers in control-button layout ([5c0a3d2](https://github.com/oleksandr-zhynzher/graph-render/commit/5c0a3d2c9369e8c7af0c1bf0378e9b4e1b67bf5f))
