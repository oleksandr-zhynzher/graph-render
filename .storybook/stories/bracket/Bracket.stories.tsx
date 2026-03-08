import type { Meta, StoryObj } from '@storybook/react';
import { bracketGraph } from './data/bracket';
import { bracketGraphR16 } from './data/bracket_r8';
import { bracketGraphQF } from './data/bracket_qf';
import { bracketGraphR64 } from './data/bracket_r64';
import { bracketGraphLive } from './data/bracket_live';
import { TournamentBracket } from '@graph-render/tournament-tree';

const meta: Meta<typeof TournamentBracket> = {
  title: 'Bracket/Squash Tournament',
  component: TournamentBracket,
  tags: ['autodocs'],
  args: {
    graph: bracketGraphQF,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof TournamentBracket>;

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
