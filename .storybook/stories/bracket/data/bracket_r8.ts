import { NxGraphInput } from '@graph-render/react';

const defaultSize = { width: 220, height: 94 };
const finalSize = { width: 240, height: 90 };

// Tournament starting from Round of 16 (16 players)
export const bracketGraphR16: NxGraphInput = {
  nodes: {
    'r16-1': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Paul Coll', seed: 1, country: 'NZL' },
          { name: 'Richie Fallows', seed: 16, country: 'GBR' },
        ],
        sets: [
          [11, 5],
          [11, 7],
        ],
      },
    },
    'r16-2': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Mostafa Asal', seed: 8, country: 'EGY' },
          { name: 'Joel Makin', seed: 9, country: 'WAL' },
        ],
        sets: [
          [11, 9],
          [9, 11],
          [11, 8],
        ],
      },
    },
    'r16-3': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Ali Farag', seed: 4, country: 'EGY' },
          { name: 'Gregoire Marche', seed: 13, country: 'FRA' },
        ],
        sets: [
          [11, 6],
          [11, 8],
        ],
      },
    },
    'r16-4': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Diego Elias', seed: 5, country: 'PER' },
          { name: 'Mathieu Castagnet', seed: 12, country: 'FRA' },
        ],
        sets: [
          [11, 7],
          [9, 11],
          [11, 6],
        ],
      },
    },
    'r16-5': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Mohamed ElShorbagy', seed: 2, country: 'EGY' },
          { name: 'Karim Abdel Gawad', seed: 15, country: 'EGY' },
        ],
        sets: [
          [11, 8],
          [11, 6],
        ],
      },
    },
    'r16-6': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Miguel Rodriguez', seed: 7, country: 'COL' },
          { name: 'Eain Yow Ng', seed: 10, country: 'MAS' },
        ],
        sets: [
          [9, 11],
          [11, 9],
          [11, 7],
        ],
      },
    },
    'r16-7': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Tarek Momen', seed: 3, country: 'EGY' },
          { name: 'James Willstrop', seed: 14, country: 'GBR' },
        ],
        sets: [
          [11, 4],
          [11, 6],
        ],
      },
    },
    'r16-8': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Marwan ElShorbagy', seed: 6, country: 'EGY' },
          { name: 'Fares Dessouky', seed: 11, country: 'EGY' },
        ],
        sets: [
          [11, 8],
          [8, 11],
          [11, 7],
        ],
      },
    },
    'qf-1': {
      size: defaultSize,
      meta: {
        stage: 'QF',
        players: [
          { name: 'Paul Coll', seed: 1, country: 'NZL' },
          { name: 'Mostafa Asal', seed: 8, country: 'EGY' },
        ],
        sets: [
          [11, 9],
          [8, 11],
          [11, 7],
        ],
      },
    },
    'qf-2': {
      size: defaultSize,
      meta: {
        stage: 'QF',
        players: [
          { name: 'Ali Farag', seed: 4, country: 'EGY' },
          { name: 'Diego Elias', seed: 5, country: 'PER' },
        ],
        sets: [
          [11, 6],
          [11, 9],
        ],
      },
    },
    'qf-3': {
      size: defaultSize,
      meta: {
        stage: 'QF',
        players: [
          { name: 'Mohamed ElShorbagy', seed: 2, country: 'EGY' },
          { name: 'Miguel Rodriguez', seed: 7, country: 'COL' },
        ],
        sets: [
          [11, 7],
          [9, 11],
          [11, 8],
        ],
      },
    },
    'qf-4': {
      size: defaultSize,
      meta: {
        stage: 'QF',
        players: [
          { name: 'Tarek Momen', seed: 3, country: 'EGY' },
          { name: 'Marwan ElShorbagy', seed: 6, country: 'EGY' },
        ],
        sets: [
          [11, 8],
          [11, 6],
        ],
      },
    },
    'sf-1': {
      size: defaultSize,
      meta: {
        stage: 'SF',
        players: [
          { name: 'Paul Coll', seed: 1, country: 'NZL' },
          { name: 'Ali Farag', seed: 4, country: 'EGY' },
        ],
        sets: [
          [9, 11],
          [11, 8],
          [9, 11],
        ],
      },
    },
    'sf-2': {
      size: defaultSize,
      meta: {
        stage: 'SF',
        players: [
          { name: 'Mohamed ElShorbagy', seed: 2, country: 'EGY' },
          { name: 'Tarek Momen', seed: 3, country: 'EGY' },
        ],
        sets: [
          [11, 7],
          [11, 9],
        ],
      },
    },
    final: {
      size: finalSize,
      meta: {
        stage: 'Final',
        players: [
          { name: 'Ali Farag', seed: 4, country: 'EGY' },
          { name: 'Mohamed ElShorbagy', seed: 2, country: 'EGY' },
        ],
        sets: [
          [11, 8],
          [9, 11],
          [11, 7],
          [11, 9],
        ],
      },
    },
  },
  adj: {
    'r16-1': { 'qf-1': { id: 'r16-1-qf-1', type: 'undirected', sourcePlayer: 0 } },
    'r16-2': { 'qf-1': { id: 'r16-2-qf-1', type: 'undirected', sourcePlayer: 0 } },
    'r16-3': { 'qf-2': { id: 'r16-3-qf-2', type: 'undirected', sourcePlayer: 0 } },
    'r16-4': { 'qf-2': { id: 'r16-4-qf-2', type: 'undirected', sourcePlayer: 0 } },
    'r16-5': { 'qf-3': { id: 'r16-5-qf-3', type: 'undirected', sourcePlayer: 0 } },
    'r16-6': { 'qf-3': { id: 'r16-6-qf-3', type: 'undirected', sourcePlayer: 0 } },
    'r16-7': { 'qf-4': { id: 'r16-7-qf-4', type: 'undirected', sourcePlayer: 0 } },
    'r16-8': { 'qf-4': { id: 'r16-8-qf-4', type: 'undirected', sourcePlayer: 0 } },
    'qf-1': { 'sf-1': { id: 'qf-1-sf-1', type: 'undirected', sourcePlayer: 0 } },
    'qf-2': { 'sf-1': { id: 'qf-2-sf-1', type: 'undirected', sourcePlayer: 1 } },
    'qf-3': { 'sf-2': { id: 'qf-3-sf-2', type: 'undirected', sourcePlayer: 0 } },
    'qf-4': { 'sf-2': { id: 'qf-4-sf-2', type: 'undirected', sourcePlayer: 0 } },
    'sf-1': { final: { id: 'sf-1-final', type: 'undirected', sourcePlayer: 1 } },
    'sf-2': { final: { id: 'sf-2-final', type: 'undirected', sourcePlayer: 0 } },
  },
};


export const bracketGraph: NxGraphInput = {
  nodes: {
    'r16-1': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Cairo Falcons', seed: 1, country: 'EGY' },
          { name: 'Doha Dashers', seed: 16, country: 'QAT' },
        ],
        sets: [
          [11, 9],
          [8, 11],
          [11, 7],
        ],
      },
    },
    'r16-2': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Madrid Rackets', seed: 8, country: 'ESP' },
          { name: 'London Lines', seed: 9, country: 'GBR' },
        ],
        sets: [
          [11, 7],
          [9, 11],
          [11, 6],
        ],
      },
    },
    'r16-3': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Paris Squeeze', seed: 5, country: 'FRA' },
          { name: 'Amsterdam Aces', seed: 12, country: 'NED' },
        ],
        sets: [
          [11, 6],
          [7, 11],
          [11, 8],
        ],
      },
    },
    'r16-4': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Boston Lobs', seed: 4, country: 'USA' },
          { name: 'Sydney Walls', seed: 13, country: 'AUS' },
        ],
        sets: [
          [8, 11],
          [11, 7],
          [11, 9],
        ],
      },
    },
    'r16-5': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Berlin Drops', seed: 2, country: 'GER' },
          { name: 'Oslo Ghosts', seed: 15, country: 'NOR' },
        ],
        sets: [
          [11, 5],
          [9, 11],
          [11, 6],
        ],
      },
    },
    'r16-6': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Zurich Zips', seed: 7, country: 'SUI' },
          { name: 'Rome Rails', seed: 10, country: 'ITA' },
        ],
        sets: [
          [9, 11],
          [11, 8],
          [11, 7],
        ],
      },
    },
    'r16-7': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Montreal Grip', seed: 6, country: 'CAN' },
          { name: 'Cape Town Spins', seed: 11, country: 'RSA' },
        ],
        sets: [
          [11, 6],
          [8, 11],
          [11, 9],
        ],
      },
    },
    'r16-8': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Tokyo Nicks', seed: 3, country: 'JPN' },
          { name: 'Seoul Drives', seed: 14, country: 'KOR' },
        ],
        sets: [
          [11, 7],
          [11, 8],
        ],
      },
    },

    'qf-1': {
      size: defaultSize,
      meta: {
        stage: 'QF',
        players: [
          { name: 'Cairo Falcons', seed: 1, country: 'EGY' },
          { name: 'Madrid Rackets', seed: 8, country: 'ESP' },
        ],
        sets: [
          [11, 8],
          [11, 7],
        ],
      },
    },
    'qf-2': {
      size: defaultSize,
      meta: {
        stage: 'QF',
        players: [
          { name: 'Paris Squeeze', seed: 5, country: 'FRA' },
          { name: 'Sydney Walls', seed: 13, country: 'AUS' },
        ],
        sets: [
          [11, 9],
          [6, 11],
          [11, 8],
        ],
      },
    },
    'qf-3': {
      size: defaultSize,
      meta: {
        stage: 'QF',
        players: [
          { name: 'Berlin Drops', seed: 2, country: 'GER' },
          { name: 'Zurich Zips', seed: 7, country: 'SUI' },
        ],
        sets: [
          [11, 6],
          [9, 11],
          [11, 7],
        ],
      },
    },
    'qf-4': {
      size: defaultSize,
      meta: {
        stage: 'QF',
        players: [
          { name: 'Montreal Grip', seed: 6, country: 'CAN' },
          { name: 'Tokyo Nicks', seed: 3, country: 'JPN' },
        ],
        sets: [
          [11, 5],
          [11, 7],
        ],
      },
    },

    'sf-1': {
      size: defaultSize,
      meta: {
        stage: 'SF',
        players: [
          { name: 'Cairo Falcons', seed: 1, country: 'EGY' },
          { name: 'Sydney Walls', seed: 13, country: 'AUS' },
        ],
        sets: [
          [11, 9],
          [6, 11],
          [11, 8],
        ],
      },
    },
    'sf-2': {
      size: defaultSize,
      meta: {
        stage: 'SF',
        players: [
          { name: 'Berlin Drops', seed: 2, country: 'GER' },
          { name: 'Tokyo Nicks', seed: 3, country: 'JPN' },
        ],
        sets: [
          [9, 11],
          [11, 7],
          [11, 8],
        ],
      },
    },

    final: {
      size: finalSize,
      meta: {
        stage: 'Final',
        players: [
          { name: 'Sydney Walls', seed: 13, country: 'AUS' },
          { name: 'Tokyo Nicks', seed: 3, country: 'JPN' },
        ],
        sets: [
          [8, 11],
          [11, 7],
          [11, 9],
        ],
      },
    },
  },
  adj: {
    'r16-1': { 'qf-1': { id: 'r16-1-qf-1', type: 'undirected' } },
    'r16-2': { 'qf-1': { id: 'r16-2-qf-1', type: 'undirected' } },
    'r16-3': { 'qf-2': { id: 'r16-3-qf-2', type: 'undirected' } },
    'r16-4': { 'qf-2': { id: 'r16-4-qf-2', type: 'undirected' } },
    'r16-5': { 'qf-3': { id: 'r16-5-qf-3', type: 'undirected' } },
    'r16-6': { 'qf-3': { id: 'r16-6-qf-3', type: 'undirected' } },
    'r16-7': { 'qf-4': { id: 'r16-7-qf-4', type: 'undirected' } },
    'r16-8': { 'qf-4': { id: 'r16-8-qf-4', type: 'undirected' } },

    'qf-1': { 'sf-1': { id: 'qf-1-sf-1', type: 'undirected' } },
    'qf-2': { 'sf-1': { id: 'qf-2-sf-1', type: 'undirected' } },
    'qf-3': { 'sf-2': { id: 'qf-3-sf-2', type: 'undirected' } },
    'qf-4': { 'sf-2': { id: 'qf-4-sf-2', type: 'undirected' } },

    'sf-1': { final: { id: 'sf-1-final', type: 'undirected' } },
    'sf-2': { final: { id: 'sf-2-final', type: 'undirected' } },

    final: {},
  },
};
