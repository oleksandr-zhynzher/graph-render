import type { MatchStatus, SquashMatchMeta } from '@graph-render/types';
import { normalizePlayers } from './normalizePlayer';
import type { NormalizedSquashMatchMeta } from '../../models/squash';

export type { NormalizedSquashMatchMeta };

const isMatchStatus = (value: unknown): value is MatchStatus => {
  return value === 'completed' || value === 'live' || value === 'upcoming';
};

const normalizeScore = (value: unknown, label: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`Invalid squash match payload: ${label} must be a non-negative number.`);
  }

  return value;
};

const normalizeSets = (value: unknown): number[][] => {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new TypeError('Invalid squash match payload: sets must be an array of score pairs.');
  }

  return value.map((entry, index) => {
    if (!Array.isArray(entry) || entry.length !== 2) {
      throw new TypeError(
        `Invalid squash match payload: sets[${index}] must contain exactly two scores.`
      );
    }

    return [
      normalizeScore(entry[0], `sets[${index}][0]`),
      normalizeScore(entry[1], `sets[${index}][1]`),
    ];
  });
};

const normalizeTiebreaks = (value: unknown): (number[] | null)[] => {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new TypeError(
      'Invalid squash match payload: tiebreaks must be an array of score pairs or null entries.'
    );
  }

  return value.map((entry, index) => {
    if (entry == null) {
      return null;
    }

    if (!Array.isArray(entry) || entry.length !== 2) {
      throw new TypeError(
        `Invalid squash match payload: tiebreaks[${index}] must contain exactly two scores or be null.`
      );
    }

    return [
      normalizeScore(entry[0], `tiebreaks[${index}][0]`),
      normalizeScore(entry[1], `tiebreaks[${index}][1]`),
    ];
  });
};

export const normalizeMatchMeta = (meta: unknown): NormalizedSquashMatchMeta => {
  if (meta != null && typeof meta !== 'object') {
    throw new TypeError('Invalid squash match payload: node meta must be an object when provided.');
  }

  const rawMeta = meta as Partial<SquashMatchMeta> | undefined;
  if (rawMeta?.status != null && !isMatchStatus(rawMeta.status)) {
    throw new TypeError(
      'Invalid squash match payload: status must be one of completed, live, or upcoming.'
    );
  }

  const sets = normalizeSets(rawMeta?.sets);
  const currentSet =
    rawMeta?.currentSet == null
      ? 0
      : typeof rawMeta.currentSet === 'number' && Number.isFinite(rawMeta.currentSet)
        ? Math.max(0, Math.min(Math.floor(rawMeta.currentSet), Math.max(sets.length - 1, 0)))
        : null;

  if (currentSet === null) {
    throw new TypeError(
      'Invalid squash match payload: currentSet must be a finite number when provided.'
    );
  }

  return {
    stage:
      typeof rawMeta?.stage === 'string' && rawMeta.stage.trim() ? rawMeta.stage.trim() : 'Stage',
    players: normalizePlayers(rawMeta?.players),
    sets,
    tiebreaks: normalizeTiebreaks(rawMeta?.tiebreaks),
    status: rawMeta?.status ?? 'completed',
    currentSet,
  };
};
