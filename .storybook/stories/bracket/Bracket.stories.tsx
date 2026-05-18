import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { BracketPlayground } from './BracketPlayground';
import { LayoutDirection, LayoutType } from '@graph-render/types';
import { SquashNodeRenderMode } from '@graph-render/tournament-tree';
import { bracketGraph } from './data/bracket';
import { bracketGraphLive } from './data/bracket_live';
import { bracketGraphQF } from './data/bracket_qf';
import { bracketGraphR16 } from './data/bracket_r8';
import { bracketGraphR64 } from './data/bracket_r64';

const meta: Meta<typeof BracketPlayground> = {
  title: 'Bracket/Squash Tournament',
  component: BracketPlayground,
  tags: ['autodocs'],
  args: {
    graph: bracketGraphQF,
    layout: LayoutType.CompactBracket,
    layoutDirection: LayoutDirection.LTR,
    routingStyle: 'orthogonal',
    curveEdges: true,
    nodeSizing: 'fixed',
    selectionMode: 'multiple',
    renderMode: SquashNodeRenderMode.Export,
    isDarkMode: false,
    isCompact: false,
    highlightMode: 'ancestry',
    hideUnmatchedSearch: false,
    marqueeSelectionEnabled: true,
    hoverHighlight: false,
    showViewportControls: true,
    searchQuery: '',
  },
  argTypes: {
    layout: {
      control: 'select',
      options: Object.values(LayoutType),
    },
    layoutDirection: {
      control: 'select',
      options: Object.values(LayoutDirection),
    },
    routingStyle: {
      control: 'select',
      options: ['smart', 'orthogonal', 'bundled'],
    },
    nodeSizing: {
      control: 'select',
      options: ['fixed', 'label', 'measured'],
    },
    selectionMode: {
      control: 'select',
      options: ['single', 'multiple'],
    },
    renderMode: {
      control: 'select',
      options: Object.values(SquashNodeRenderMode),
    },
    highlightMode: {
      control: 'select',
      options: ['match', 'ancestry'],
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof BracketPlayground>;

export const Quarterfinals: Story = {
  name: 'Quarterfinals (8 Players)',
  args: {
    graph: bracketGraphQF,
  },
};

export const RoundOf16: Story = {
  name: 'Round of 16 (16 Players)',
  args: {
    graph: bracketGraphR16,
  },
};

export const RoundOf32: Story = {
  name: 'Round of 32 (32 Players)',
  args: {
    graph: bracketGraph,
  },
};

export const RoundOf64: Story = {
  name: 'Round of 64 (64 Players)',
  args: {
    graph: bracketGraphR64,
  },
};

export const LiveMatches: Story = {
  name: 'Live Matches with Tiebreaks',
  args: {
    graph: bracketGraphLive,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates live match indicators (blue border, pulsing dot), winning score highlighting in blue for live matches, tiebreak score display below set scores, and upcoming match styling.',
      },
    },
  },
};
