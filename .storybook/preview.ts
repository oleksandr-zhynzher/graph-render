import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    // Do not use argTypesRegex: auto-injected on* actions break Graph stories when
    // callbacks run during render/effects (Storybook 8.6+). Use graphStoryActionArgs instead.
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'fullscreen',
  },
};

export default preview;
