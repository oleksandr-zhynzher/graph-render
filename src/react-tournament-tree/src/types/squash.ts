export interface SquashPlayer {
  name: string;
  seed?: number;
  country?: string;
}

export type MatchStatus = 'completed' | 'live' | 'upcoming';

export interface SquashMatchMeta {
  stage?: string;
  players?: SquashPlayer[];
  sets?: number[][];
  tiebreaks?: (number[] | null)[]; // Tiebreak scores for each set, null if no tiebreak
  status?: MatchStatus;
  currentSet?: number; // For live matches, which set is being played
}
