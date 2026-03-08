# Graph Render Monorepo

A TypeScript monorepo for graph rendering and tournament bracket visualization, built with React and Vite.

## 📦 Packages

This monorepo contains the following packages:

- **`@graph-render/types`** - Core type definitions for graph rendering
- **`@graph-render/core`** - Core graph rendering logic and algorithms
- **`@graph-render/react`** - React components for graph visualization
- **`@graph-render/tournament-tree`** - Tournament bracket and tree visualization components

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **Yarn** (v1.22 or higher)

Check your versions:

```bash
node --version
yarn --version
```

### Installation

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone <repository-url>
   cd graph-render
   ```

2. **Install dependencies**:

   ```bash
   yarn install
   ```

3. **Build all packages**:

   ```bash
   yarn build:all
   ```

   This will compile all TypeScript packages in the correct dependency order.

   > **Note**: The build system uses TypeScript path mappings that reference the compiled `dist` folders. The types package must be built first, followed by core, then the React packages. The `yarn build:all` command handles this automatically using Nx.

### Running the Development Environment

Start Storybook to explore and develop components interactively:

```bash
yarn storybook
```

This will start the Storybook development server at **http://localhost:6006**

## 🛠️ Available Scripts

### Build Commands

- `yarn build:all` - Build all packages in the monorepo
- `yarn build` - Alias for `build:all`
- `yarn build:affected` - Build only affected packages (Nx)

### Development

- `yarn storybook` - Start Storybook development server on port 6006
- `yarn build-storybook` - Build Storybook for production

### Testing & Quality

- `yarn test` - Run tests across all packages
- `yarn test:affected` - Run tests for affected packages only
- `yarn lint` - Run linting across all packages
- `yarn lint:affected` - Lint affected packages only

### Code Formatting

- `yarn format:all` - Format all files with Prettier
- `yarn format:check` - Check formatting without making changes
- `yarn format` - Format changed files
- `yarn format:affected` - Format affected files only

### Visualization

- `yarn graph` - View the dependency graph of the monorepo (Nx)

## 📁 Project Structure

```
graph-render/
├── src/
│   ├── types/                    # Core type definitions
│   │   ├── src/
│   │   └── dist/                 # Compiled output
│   │
│   ├── core-graph-render/        # Core rendering logic
│   │   ├── src/
│   │   │   ├── edges/            # Edge routing & collision detection
│   │   │   ├── layouts/          # Layout algorithms (tree, grid, etc.)
│   │   │   ├── rendering/        # SVG rendering utilities
│   │   │   └── utils/            # Graph utilities & parsers
│   │   └── dist/                 # Compiled output
│   │
│   ├── react-graph-render/       # React components for graphs
│   │   ├── src/
│   │   │   ├── components/       # Graph, Node, Edge components
│   │   │   └── hooks/            # React hooks
│   │   └── dist/                 # Compiled output
│   │
│   └── react-tournament-tree/    # Tournament bracket components
│       ├── src/
│       │   ├── components/       # Bracket & node components
│       │   ├── contexts/         # React contexts
│       │   ├── types/            # Tournament-specific types
│       │   └── utils/            # Helper utilities
│       └── dist/                 # Compiled output
│
├── .storybook/                   # Storybook configuration
│   └── stories/                  # Component stories
├── package.json                  # Root package.json with workspaces
├── nx.json                       # Nx configuration
└── tsconfig.base.json           # Base TypeScript configuration
```

## 🔧 Building Individual Packages

If you need to build packages individually:

```bash
# Build types (required first, as other packages depend on it)
cd src/types && yarn build

# Build core
cd src/core-graph-render && yarn build

# Build React packages
cd src/react-graph-render && yarn build
cd src/react-tournament-tree && yarn build
```

## 🏗️ Development Workflow

1. **Make changes** to the source code in any package
2. **Rebuild the package** using `yarn build` in that package's directory, or `yarn build:all` from the root
3. **View changes** in Storybook (it will auto-reload)
4. **Run tests and linting** before committing:
   ```bash
   yarn lint
   yarn test
   yarn format:check
   ```

## 📝 Notes

- **Build Order Matters**: The `types` package must be built before other packages since they depend on it
- **Dist Folders**: All compiled output goes to `dist/` folders which are gitignored
- **Monorepo Management**: This project uses Yarn Workspaces and Nx for efficient monorepo management

## 🤝 Contributing

1. Make your changes
2. Ensure all packages build successfully: `yarn build:all`
3. Run linting and formatting: `yarn lint && yarn format:all`
4. Test your changes in Storybook: `yarn storybook`
5. Commit your changes

## 📄 License

MIT License - see LICENSE file for details
