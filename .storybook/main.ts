import path from 'node:path';

import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['./stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@graph-render/types': path.resolve(__dirname, '../src/types/src'),
      '@graph-render/core': path.resolve(__dirname, '../src/core-graph-render/src'),
      '@graph-render/react': path.resolve(__dirname, '../src/react-graph-render/src'),
      '@graph-render/tournament-tree': path.resolve(__dirname, '../src/react-tournament-tree/src'),
    };
    return config;
  },
};

export default config;
