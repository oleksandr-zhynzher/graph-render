import { access } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const packages = [
  'src/types',
  'src/core-graph-render',
  'src/react-graph-render',
  'src/react-tournament-tree',
];

for (const packagePath of packages) {
  const entrypoint = `${packagePath}/dist/index.js`;
  await access(entrypoint);
  await import(pathToFileURL(entrypoint).href);
}
