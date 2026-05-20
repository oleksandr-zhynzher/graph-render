import type { SquashPlayer } from '@graph-render/types/tournament';

import { DEFAULT_PLAYERS } from '../../constants';

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const normalizePlayerKey = (value: string): string => value.trim().toLowerCase();

export const normalizePlayer = (value: unknown, label: string): SquashPlayer => {
  if (!value || typeof value !== 'object') {
    throw new TypeError(`Invalid squash match payload: ${label} must be an object.`);
  }

  const player = value as Partial<SquashPlayer>;
  if (typeof player.name !== 'string' || !player.name.trim()) {
    throw new TypeError(`Invalid squash match payload: ${label}.name must be a non-empty string.`);
  }

  if (player.seed != null && !isFiniteNumber(player.seed)) {
    throw new TypeError(`Invalid squash match payload: ${label}.seed must be a finite number.`);
  }

  if (player.country != null && (typeof player.country !== 'string' || !player.country.trim())) {
    throw new TypeError(
      `Invalid squash match payload: ${label}.country must be a non-empty string when provided.`
    );
  }

  const country = player.country?.trim();
  return {
    name: player.name.trim(),
    ...(player.seed !== undefined ? { seed: player.seed } : {}),
    ...(country ? { country } : {}),
  };
};

export const normalizePlayers = (value: unknown): readonly [SquashPlayer, SquashPlayer] => {
  if (value == null) {
    return [
      DEFAULT_PLAYERS[0] ?? { name: 'TBD', seed: 0 },
      DEFAULT_PLAYERS[1] ?? { name: 'TBD', seed: 0 },
    ];
  }

  if (!Array.isArray(value) || value.length !== 2) {
    throw new TypeError('Invalid squash match payload: players must contain exactly two entries.');
  }

  return [normalizePlayer(value[0], 'players[0]'), normalizePlayer(value[1], 'players[1]')];
};
