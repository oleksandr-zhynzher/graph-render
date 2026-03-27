## @graph-render/core [1.0.2](https://github.com/oleksandr-zhynzher/graph-render/compare/@graph-render/core@1.0.1...@graph-render/core@1.0.2) (2026-03-27)

### 🐛 Bug Fixes

* **core:** make failure and validation policies explicit ([9236ba2](https://github.com/oleksandr-zhynzher/graph-render/commit/9236ba2bd01d571e08ce2f80d941abdf3115f8b0))


### Dependencies

* **@graph-render/types:** upgraded to 1.0.2

## @graph-render/core [1.0.1](https://github.com/oleksandr-zhynzher/graph-render/compare/@graph-render/core@1.0.0...@graph-render/core@1.0.1) (2026-03-19)

### 🐛 Bug Fixes

* **core:** bound smart routing collision scans ([4987920](https://github.com/oleksandr-zhynzher/graph-render/commit/4987920aa46ca1535ca4b69f2f5d47eb4edbf244))
* **core:** harden config normalization and stability ([983e372](https://github.com/oleksandr-zhynzher/graph-render/commit/983e372b767f20c12f220ca2206eac87ab31887c))
* **core:** reject dangling endpoints with explicit node maps ([b64d493](https://github.com/oleksandr-zhynzher/graph-render/commit/b64d493ccaad520d558195861076e11a194228d7))
* **labels:** cap label work and render multiline defaults ([395c444](https://github.com/oleksandr-zhynzher/graph-render/commit/395c44417df8d9476023090668596f3ec0e68fcc))


### Dependencies

* **@graph-render/types:** upgraded to 1.0.1

## @graph-render/core 1.0.0 (2026-03-17)

### 🚀 Features

* **core:** add layered radial and flow layouts ([a934bc0](https://github.com/oleksandr-zhynzher/graph-render/commit/a934bc0f06325b2b7b41e044483f8ec487fcdec8))
* **core:** add node measurement and auto sizing ([721a082](https://github.com/oleksandr-zhynzher/graph-render/commit/721a08206bf26b979f0e5de9e97cfcc34d562e1f))
* **core:** improve edge routing and labels ([273bdcb](https://github.com/oleksandr-zhynzher/graph-render/commit/273bdcb4e30f47a2d9bd75428739ee03ff5cea10))

### 🐛 Bug Fixes

* add numeric parameter validation; extract verticalGap magic constants ([fd70659](https://github.com/oleksandr-zhynzher/graph-render/commit/fd70659cbd4ccdfa38577ce7ad187e69a629fd28))
* clamp node y-coordinate to prevent layout overflow ([4e53808](https://github.com/oleksandr-zhynzher/graph-render/commit/4e53808070789e53a98f50db33c67d239844f391))
* compute verticalGap per-column proportional to column max node height ([915ed3b](https://github.com/oleksandr-zhynzher/graph-render/commit/915ed3ba924c7d2e2f9be8f8aab1f4264f4b8d08))
* correct (height, width) parameter order in orthogonalFlowLayout ([ff8cdc5](https://github.com/oleksandr-zhynzher/graph-render/commit/ff8cdc5b48749f8386dca0311cc5731e8f5a7459))
* correct RTL variable-width node alignment in orthogonalFlowLayout ([1faac95](https://github.com/oleksandr-zhynzher/graph-render/commit/1faac952b840bf56294216edab115d3187554a8e))
* replace silent ?? 0 level fallback with throwing assertion ([47a010b](https://github.com/oleksandr-zhynzher/graph-render/commit/47a010b923637517a21868be2df447348f20c6e8))
* use per-column max width for column pitch and RTL alignment ([2302240](https://github.com/oleksandr-zhynzher/graph-render/commit/2302240d013ce86d598f14ef20fca89de0e623e1))

### ⚡ Performance Improvements

* replace O(N^2) spread with push in bucket construction ([178c094](https://github.com/oleksandr-zhynzher/graph-render/commit/178c09418dace9b43a1b243c1daebd598481728f))

### ♻️ Code Refactoring

* extract assignDagLevels to treeTopology; remove duplicate buildLevels/assignLayers ([298eeb6](https://github.com/oleksandr-zhynzher/graph-render/commit/298eeb6e19cd2c49266b1560a6409767e1b2611b))
* make centering y-start overflow fallback explicit ([082a858](https://github.com/oleksandr-zhynzher/graph-render/commit/082a85888125f9beaf987922c64a6dd2b0d273cd))


### Dependencies

* **@graph-render/types:** upgraded to 1.0.0
