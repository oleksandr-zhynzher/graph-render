import path from 'path';
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
      ...(config.resolve.alias || {}),
      'core-graph-render': path.resolve(__dirname, '../core-graph-render/src'),
      'core-graph-render/*': path.resolve(__dirname, '../core-graph-render/src/*'),
      'react-graph-render': path.resolve(__dirname, '../react-graph-render/src'),
      'react-graph-render/*': path.resolve(__dirname, '../react-graph-render/src/*'),
      'react-tournament-tree': path.resolve(__dirname, '../react-tournament-tree/src'),
      'react-tournament-tree/*': path.resolve(__dirname, '../react-tournament-tree/src/*'),
    };
    return config;
  },
};

export default config;
