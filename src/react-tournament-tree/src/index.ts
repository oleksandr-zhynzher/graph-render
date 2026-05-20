'use client';

export { BracketToolbar } from './components/BracketToolbar';
export { SquashNode } from './components/SquashNode';
export { TournamentBracket } from './components/TournamentBracket';
export {
  COMPACT_TOURNAMENT_CONFIG,
  DARK_COMPACT_TOURNAMENT_CONFIG,
  DARK_TOURNAMENT_CONFIG,
  DEFAULT_TOURNAMENT_CONFIG,
  NODE_DIMENSIONS,
  NODE_DIMENSIONS_COMPACT,
  NODE_DIMENSIONS_STAGE_NAV,
} from './constants';
export { ThemeMode } from './constants/themeMode';
export {
  BracketAppearanceProvider,
  useBracketAppearance,
} from './contexts/BracketAppearanceContext';
/* eslint-disable @typescript-eslint/no-deprecated -- legacy theme API kept for backward compatibility */
export { BracketThemeProvider, useBracketTheme } from './contexts/BracketThemeContext';
export type {
  TournamentBracketInteractionOptions,
  TournamentBracketProps,
  TournamentBracketThemeOptions,
  TournamentBracketToolbarOptions,
} from './models/tournamentBracket';
/* eslint-enable @typescript-eslint/no-deprecated -- legacy theme API kept for backward compatibility */
export type {
  ResolvedBracketAppearance,
  ResolvedBracketFrameStyle,
  ResolvedBracketHeaderStyle,
  ResolvedBracketStageLabelsStyle,
  ResolvedBracketTypography,
  ResolvedMatchCardScoreStyle,
  ResolvedMatchCardStyle,
} from './utils/resolveBracketAppearance';
export {
  roundLabelsForGraph,
  roundLabelsForMatchCount,
  roundLabelsForRoundCount,
} from './utils/roundLabels';
export type {
  SquashMatchMeta,
  SquashNodeData,
  SquashPlayer,
  SquashPositionedNode,
  StageBounds,
  StageView,
  StageViewportResult,
  TournamentBracketAppearance,
} from '@graph-render/types/tournament';
export {
  MatchStatus,
  SquashNodeRenderMode,
  VerticalStagePosition,
} from '@graph-render/types/tournament';
