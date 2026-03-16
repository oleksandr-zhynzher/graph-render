import { NxGraphInput } from '@graph-render/react';

const defaultSize = { width: 280, height: 112 };
const finalSize = { width: 280, height: 112 };

// Tournament starting from Round of 32 (32 players)
export const bracketGraph: NxGraphInput = {
  nodes: {
    'r32-1': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Ali Farag', seed: 1, country: 'EGY' },
          { name: 'Victor Crouin', seed: 32, country: 'FRA' },
        ],
        sets: [
          [11, 4],
          [11, 6],
          [11, 3],
        ],
      },
    },
    'r32-2': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Diego Elias', seed: 16, country: 'PER' },
          { name: 'James Willstrop', seed: 17, country: 'GBR' },
        ],
        sets: [
          [11, 8],
          [9, 11],
          [11, 7],
        ],
      },
    },
    'r32-3': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Paul Coll', seed: 8, country: 'NZL' },
          { name: 'Nicolas Mueller', seed: 25, country: 'SUI' },
        ],
        sets: [
          [11, 6],
          [11, 9],
        ],
      },
    },
    'r32-4': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Mostafa Asal', seed: 9, country: 'EGY' },
          { name: 'Dimitri Steinmann', seed: 24, country: 'SUI' },
        ],
        sets: [
          [11, 5],
          [7, 11],
          [11, 8],
        ],
      },
    },
    'r32-5': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Mohamed ElShorbagy', seed: 4, country: 'EGY' },
          { name: 'Cesar Salazar', seed: 29, country: 'MEX' },
        ],
        sets: [
          [11, 3],
          [11, 5],
        ],
      },
    },
    'r32-6': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Joel Makin', seed: 13, country: 'WAL' },
          { name: 'Patrick Rooney', seed: 20, country: 'GBR' },
        ],
        sets: [
          [11, 9],
          [8, 11],
          [11, 6],
        ],
      },
    },
    'r32-7': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Marwan ElShorbagy', seed: 5, country: 'EGY' },
          { name: 'Raphael Kandra', seed: 28, country: 'GER' },
        ],
        sets: [
          [11, 7],
          [11, 4],
        ],
      },
    },
    'r32-8': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Gregoire Marche', seed: 12, country: 'FRA' },
          { name: 'Omar Mosaad', seed: 21, country: 'EGY' },
        ],
        sets: [
          [9, 11],
          [11, 8],
          [11, 7],
        ],
      },
    },
    'r32-9': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Tarek Momen', seed: 2, country: 'EGY' },
          { name: 'Youssef Ibrahim', seed: 31, country: 'EGY' },
        ],
        sets: [
          [11, 6],
          [11, 8],
        ],
      },
    },
    'r32-10': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Karim Abdel Gawad', seed: 15, country: 'EGY' },
          { name: 'Baptiste Masotti', seed: 18, country: 'FRA' },
        ],
        sets: [
          [11, 7],
          [9, 11],
          [11, 6],
        ],
      },
    },
    'r32-11': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Miguel Rodriguez', seed: 7, country: 'COL' },
          { name: 'Saurav Ghosal', seed: 26, country: 'IND' },
        ],
        sets: [
          [11, 5],
          [11, 7],
        ],
      },
    },
    'r32-12': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Fares Dessouky', seed: 10, country: 'EGY' },
          { name: 'Eain Yow Ng', seed: 23, country: 'MAS' },
        ],
        sets: [
          [11, 9],
          [8, 11],
          [11, 7],
        ],
      },
    },
    'r32-13': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Mazen Hesham', seed: 3, country: 'EGY' },
          { name: 'Mohamed Abouelghar', seed: 30, country: 'EGY' },
        ],
        sets: [
          [11, 7],
          [11, 5],
        ],
      },
    },
    'r32-14': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Richie Fallows', seed: 14, country: 'GBR' },
          { name: 'Rowan Elaraby', seed: 19, country: 'EGY' },
        ],
        sets: [
          [9, 11],
          [11, 7],
          [11, 9],
        ],
      },
    },
    'r32-15': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Youssef Soliman', seed: 6, country: 'EGY' },
          { name: 'Abdulla Al Tamimi', seed: 27, country: 'UAE' },
        ],
        sets: [
          [11, 4],
          [11, 6],
        ],
      },
    },
    'r32-16': {
      size: defaultSize,
      meta: {
        stage: 'R32',
        players: [
          { name: 'Mathieu Castagnet', seed: 11, country: 'FRA' },
          { name: 'Declan James', seed: 22, country: 'GBR' },
        ],
        sets: [
          [11, 7],
          [9, 11],
          [11, 8],
        ],
      },
    },
    'r16-1': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Ali Farag', seed: 1, country: 'EGY' },
          { name: 'Diego Elias', seed: 16, country: 'PER' },
        ],
        sets: [
          [11, 7],
          [9, 11],
          [11, 8],
        ],
      },
    },
    'r16-2': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Paul Coll', seed: 8, country: 'NZL' },
          { name: 'Mostafa Asal', seed: 9, country: 'EGY' },
        ],
        sets: [
          [8, 11],
          [11, 9],
          [9, 11],
        ],
      },
    },
    'r16-3': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Mohamed ElShorbagy', seed: 4, country: 'EGY' },
          { name: 'Joel Makin', seed: 13, country: 'WAL' },
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
          { name: 'Marwan ElShorbagy', seed: 5, country: 'EGY' },
          { name: 'Gregoire Marche', seed: 12, country: 'FRA' },
        ],
        sets: [
          [11, 9],
          [7, 11],
          [11, 7],
        ],
      },
    },
    'r16-5': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Tarek Momen', seed: 2, country: 'EGY' },
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
          { name: 'Fares Dessouky', seed: 10, country: 'EGY' },
        ],
        sets: [
          [9, 11],
          [11, 8],
          [11, 9],
        ],
      },
    },
    'r16-7': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Mazen Hesham', seed: 3, country: 'EGY' },
          { name: 'Richie Fallows', seed: 14, country: 'GBR' },
        ],
        sets: [
          [11, 5],
          [11, 7],
        ],
      },
    },
    'r16-8': {
      size: defaultSize,
      meta: {
        stage: 'R16',
        players: [
          { name: 'Youssef Soliman', seed: 6, country: 'EGY' },
          { name: 'Mathieu Castagnet', seed: 11, country: 'FRA' },
        ],
        sets: [
          [11, 6],
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
          { name: 'Ali Farag', seed: 1, country: 'EGY' },
          { name: 'Mostafa Asal', seed: 9, country: 'EGY' },
        ],
        sets: [
          [11, 9],
          [9, 11],
          [11, 8],
        ],
      },
    },
    'qf-2': {
      size: defaultSize,
      meta: {
        stage: 'QF',
        players: [
          { name: 'Mohamed ElShorbagy', seed: 4, country: 'EGY' },
          { name: 'Marwan ElShorbagy', seed: 5, country: 'EGY' },
        ],
        sets: [
          [11, 7],
          [11, 9],
        ],
      },
    },
    'qf-3': {
      size: defaultSize,
      meta: {
        stage: 'QF',
        players: [
          { name: 'Tarek Momen', seed: 2, country: 'EGY' },
          { name: 'Miguel Rodriguez', seed: 7, country: 'COL' },
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
          { name: 'Mazen Hesham', seed: 3, country: 'EGY' },
          { name: 'Youssef Soliman', seed: 6, country: 'EGY' },
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
          { name: 'Ali Farag', seed: 1, country: 'EGY' },
          { name: 'Mohamed ElShorbagy', seed: 4, country: 'EGY' },
        ],
        sets: [
          [11, 9],
          [8, 11],
          [11, 7],
        ],
      },
    },
    'sf-2': {
      size: defaultSize,
      meta: {
        stage: 'SF',
        players: [
          { name: 'Tarek Momen', seed: 2, country: 'EGY' },
          { name: 'Mazen Hesham', seed: 3, country: 'EGY' },
        ],
        sets: [
          [11, 6],
          [11, 9],
        ],
      },
    },
    final: {
      size: finalSize,
      meta: {
        stage: 'Final',
        players: [
          { name: 'Ali Farag', seed: 1, country: 'EGY' },
          { name: 'Tarek Momen', seed: 2, country: 'EGY' },
        ],
        sets: [
          [11, 8],
          [9, 11],
          [11, 9],
          [11, 7],
        ],
      },
    },
  },
  adj: {
    'r32-1': { 'r16-1': { id: 'r32-1-r16-1', type: 'undirected', sourcePlayer: 0 } },
    'r32-2': { 'r16-1': { id: 'r32-2-r16-1', type: 'undirected', sourcePlayer: 0 } },
    'r32-3': { 'r16-2': { id: 'r32-3-r16-2', type: 'undirected', sourcePlayer: 0 } },
    'r32-4': { 'r16-2': { id: 'r32-4-r16-2', type: 'undirected', sourcePlayer: 0 } },
    'r32-5': { 'r16-3': { id: 'r32-5-r16-3', type: 'undirected', sourcePlayer: 0 } },
    'r32-6': { 'r16-3': { id: 'r32-6-r16-3', type: 'undirected', sourcePlayer: 0 } },
    'r32-7': { 'r16-4': { id: 'r32-7-r16-4', type: 'undirected', sourcePlayer: 0 } },
    'r32-8': { 'r16-4': { id: 'r32-8-r16-4', type: 'undirected', sourcePlayer: 0 } },
    'r32-9': { 'r16-5': { id: 'r32-9-r16-5', type: 'undirected', sourcePlayer: 0 } },
    'r32-10': { 'r16-5': { id: 'r32-10-r16-5', type: 'undirected', sourcePlayer: 0 } },
    'r32-11': { 'r16-6': { id: 'r32-11-r16-6', type: 'undirected', sourcePlayer: 0 } },
    'r32-12': { 'r16-6': { id: 'r32-12-r16-6', type: 'undirected', sourcePlayer: 1 } },
    'r32-13': { 'r16-7': { id: 'r32-13-r16-7', type: 'undirected', sourcePlayer: 0 } },
    'r32-14': { 'r16-7': { id: 'r32-14-r16-7', type: 'undirected', sourcePlayer: 0 } },
    'r32-15': { 'r16-8': { id: 'r32-15-r16-8', type: 'undirected', sourcePlayer: 0 } },
    'r32-16': { 'r16-8': { id: 'r32-16-r16-8', type: 'undirected', sourcePlayer: 0 } },
    'r16-1': { 'qf-1': { id: 'r16-1-qf-1', type: 'undirected', sourcePlayer: 0 } },
    'r16-2': { 'qf-1': { id: 'r16-2-qf-1', type: 'undirected', sourcePlayer: 1 } },
    'r16-3': { 'qf-2': { id: 'r16-3-qf-2', type: 'undirected', sourcePlayer: 0 } },
    'r16-4': { 'qf-2': { id: 'r16-4-qf-2', type: 'undirected', sourcePlayer: 0 } },
    'r16-5': { 'qf-3': { id: 'r16-5-qf-3', type: 'undirected', sourcePlayer: 0 } },
    'r16-6': { 'qf-3': { id: 'r16-6-qf-3', type: 'undirected', sourcePlayer: 0 } },
    'r16-7': { 'qf-4': { id: 'r16-7-qf-4', type: 'undirected', sourcePlayer: 0 } },
    'r16-8': { 'qf-4': { id: 'r16-8-qf-4', type: 'undirected', sourcePlayer: 0 } },
    'qf-1': { 'sf-1': { id: 'qf-1-sf-1', type: 'undirected', sourcePlayer: 0 } },
    'qf-2': { 'sf-1': { id: 'qf-2-sf-1', type: 'undirected', sourcePlayer: 0 } },
    'qf-3': { 'sf-2': { id: 'qf-3-sf-2', type: 'undirected', sourcePlayer: 0 } },
    'qf-4': { 'sf-2': { id: 'qf-4-sf-2', type: 'undirected', sourcePlayer: 0 } },
    'sf-1': { final: { id: 'sf-1-final', type: 'undirected', sourcePlayer: 0 } },
    'sf-2': { final: { id: 'sf-2-final', type: 'undirected', sourcePlayer: 0 } },
  },
};
