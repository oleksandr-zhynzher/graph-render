import type { TournamentBracketAppearance } from '@graph-render/types/tournament';

import {
  DEFAULT_MATCH_CARD_COMPACT,
  DEFAULT_MATCH_CARD_STANDARD,
  DEFAULT_TYPOGRAPHY,
} from '../constants/bracketAppearanceDefaults';
import { BODY_FONT_FAMILY, SCORE_FONT_FAMILY } from '../constants/squashNode';
import { THEME_COLORS_DARK, THEME_COLORS_LIGHT } from '../constants/themeColors';
import { ThemeMode } from '../constants/themeMode';
import type { ResolvedBracketAppearance } from '../models/bracketAppearanceResolved';
import {
  mergeMatchCardStyle,
  mergeThemeColors,
  resolveFrameStyle,
  resolveHeaderStyle,
  resolveStageLabelsStyle,
} from './bracketAppearanceResolve';

export type {
  ResolvedBracketAppearance,
  ResolvedBracketFrameStyle,
  ResolvedBracketHeaderStyle,
  ResolvedBracketStageLabelsStyle,
  ResolvedBracketTypography,
  ResolvedMatchCardScoreStyle,
  ResolvedMatchCardStyle,
} from '../models/bracketAppearanceResolved';

export function resolveBracketAppearance(
  appearance: TournamentBracketAppearance | undefined,
  isDarkMode: boolean,
  compact: boolean
): ResolvedBracketAppearance {
  const mode = isDarkMode ? ThemeMode.Dark : ThemeMode.Light;
  const baseColors = isDarkMode ? THEME_COLORS_DARK : THEME_COLORS_LIGHT;
  const colorOverrides = isDarkMode ? appearance?.colors?.dark : appearance?.colors?.light;
  const matchCardBase = compact ? DEFAULT_MATCH_CARD_COMPACT : DEFAULT_MATCH_CARD_STANDARD;
  const matchCardOverride = compact
    ? appearance?.matchCard?.compact
    : appearance?.matchCard?.standard;

  return {
    mode,
    compact,
    colors: mergeThemeColors(baseColors, colorOverrides),
    typography: {
      bodyFontFamily:
        appearance?.typography?.bodyFontFamily ??
        DEFAULT_TYPOGRAPHY.bodyFontFamily ??
        BODY_FONT_FAMILY,
      scoreFontFamily:
        appearance?.typography?.scoreFontFamily ??
        DEFAULT_TYPOGRAPHY.scoreFontFamily ??
        SCORE_FONT_FAMILY,
    },
    matchCard: mergeMatchCardStyle(matchCardBase, matchCardOverride),
    frame: resolveFrameStyle(appearance?.frame, compact, isDarkMode),
    header: resolveHeaderStyle(appearance?.header, compact),
    stageLabels: resolveStageLabelsStyle(appearance?.stageLabels, compact, isDarkMode),
  };
}
