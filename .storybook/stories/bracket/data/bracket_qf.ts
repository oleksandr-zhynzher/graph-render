import { NxGraphInput } from '@graph-render/react';

const defaultSize = { width: 280, height: 112 };
const finalSize = { width: 280, height: 112 };

// Tournament starting from Quarterfinals (8 players)
export const bracketGraphQF: NxGraphInput = {
  nodes: {
    'qf-1': {
      size: defaultSize,
      meta: {
        stage: 'QF',
        players: [
          { name: 'Nour El Sherbini', seed: 1, country: 'EGY' },
          { name: 'Hania El Hammamy', seed: 8, country: 'EGY' },
        ],
        sets: [
          [11, 7],
          [11, 9],
        ],
      },
    },
    'qf-2': {
      size: defaultSize,
      meta: {
        stage: 'QF',
        players: [
          { name: 'Nouran Gohar', seed: 4, country: 'EGY' },
          { name: 'Amanda Sobhy', seed: 5, country: 'USA' },
        ],
        sets: [
          [11, 9],
          [9, 11],
          [11, 7],
        ],
      },
    },
    'qf-3': {
      size: defaultSize,
      meta: {
        stage: 'QF',
        players: [
          { name: 'Nour El Tayeb', seed: 2, country: 'EGY' },
          { name: 'Camille Serme', seed: 7, country: 'FRA' },
        ],
        sets: [
          [11, 6],
          [11, 8],
        ],
      },
    },
    'qf-4': {
      size: defaultSize,
      meta: {
        stage: 'QF',
        players: [
          { name: 'Raneem El Welily', seed: 3, country: 'EGY' },
          { name: 'Joelle King', seed: 6, country: 'NZL' },
        ],
        sets: [
          [11, 9],
          [8, 11],
          [11, 7],
        ],
      },
    },
    'sf-1': {
      size: defaultSize,
      meta: {
        stage: 'SF',
        players: [
          { name: 'Nour El Sherbini', seed: 1, country: 'EGY' },
          { name: 'Nouran Gohar', seed: 4, country: 'EGY' },
        ],
        sets: [
          [11, 8],
          [9, 11],
          [11, 6],
        ],
      },
    },
    'sf-2': {
      size: defaultSize,
      meta: {
        stage: 'SF',
        players: [
          { name: 'Nour El Tayeb', seed: 2, country: 'EGY' },
          { name: 'Raneem El Welily', seed: 3, country: 'EGY' },
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
          { name: 'Nour El Sherbini', seed: 1, country: 'EGY' },
          { name: 'Nour El Tayeb', seed: 2, country: 'EGY' },
        ],
        sets: [
          [11, 9],
          [9, 11],
          [11, 7],
          [11, 6],
        ],
      },
    },
  },
  adj: {
    'qf-1': { 'sf-1': { id: 'qf-1-sf-1', type: 'undirected', sourcePlayer: 0 } },
    'qf-2': { 'sf-1': { id: 'qf-2-sf-1', type: 'undirected', sourcePlayer: 0 } },
    'qf-3': { 'sf-2': { id: 'qf-3-sf-2', type: 'undirected', sourcePlayer: 0 } },
    'qf-4': { 'sf-2': { id: 'qf-4-sf-2', type: 'undirected', sourcePlayer: 0 } },
    'sf-1': { final: { id: 'sf-1-final', type: 'undirected', sourcePlayer: 0 } },
    'sf-2': { final: { id: 'sf-2-final', type: 'undirected', sourcePlayer: 0 } },
  },
};
