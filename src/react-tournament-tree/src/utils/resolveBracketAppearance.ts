import type {
  BracketFrameAppearance,
  BracketHeaderAppearance,
  BracketStageLabelsAppearance,
  BracketTypographyAppearance,
  MatchCardAppearance,
  MatchCardScoreAppearance,
  SquashThemeColors,
  SquashThemeColorsOverrides,
  TournamentBracketAppearance,
} from '@graph-render/types';

import {
  BODY_FONT_FAMILY,
  NODE_DIMENSIONS,
  NODE_DIMENSIONS_COMPACT,
  SCORE_LAYOUT_COMPACT,
  SCORE_LAYOUT_DEFAULT,
  SCORE_FONT_FAMILY,
  THEME_COLORS_DARK,
  THEME_COLORS_LIGHT,
} from '../constants';
import { ThemeMode } from '../constants/themeMode';

export interface ResolvedMatchCardScoreStyle {
  readonly segmentWidth: number;
  readonly segmentGap: number;
  readonly fontSize: number;
  readonly matchCountFontSize: number;
}

export interface ResolvedMatchCardStyle {
  readonly width: number;
  readonly height: number;
  readonly borderRadius: number;
  readonly insetX: number;
  readonly badgeSize: number;
  readonly badgePad: number;
  readonly badgeFontSize: number;
  readonly nameFontSize: number;
  readonly matchCountWidth: number;
  readonly matchCountTrailingGap: number;
  readonly scoreGroupTrailingGap: number;
  readonly rowPadding: string;
  readonly rowGap: number;
  readonly score: ResolvedMatchCardScoreStyle;
}

export interface ResolvedBracketTypography {
  readonly bodyFontFamily: string;
  readonly scoreFontFamily: string;
}

export interface ResolvedBracketFrameStyle {
  readonly maxWidth: number | string;
  readonly borderRadius: number;
  readonly contentPadding: string;
  readonly canvasBackground: string;
}

export interface ResolvedBracketHeaderStyle {
  readonly gap: number;
  readonly minHeight: number;
  readonly padding: string;
  readonly iconSize: number;
  readonly iconRadius: number;
  readonly titleFontSize: number;
  readonly badgeFontSize: number;
  readonly badgePadding: string;
  readonly badgeDotSize: number;
}

export interface ResolvedBracketStageLabelsStyle {
  readonly background: string;
  readonly padding: string;
  readonly paddingNavigation: string;
  readonly gridGap: number;
  readonly labelFontSize: number;
  readonly activePillFontSize: number;
  readonly activePillPadding: string;
  readonly counterFontSize: number;
  readonly navColor: string;
  readonly navBorder: string;
}

export interface ResolvedBracketAppearance {
  readonly mode: ThemeMode;
  readonly compact: boolean;
  readonly colors: SquashThemeColors;
  readonly typography: ResolvedBracketTypography;
  readonly matchCard: ResolvedMatchCardStyle;
  readonly frame: ResolvedBracketFrameStyle;
  readonly header: ResolvedBracketHeaderStyle;
  readonly stageLabels: ResolvedBracketStageLabelsStyle;
}

const DEFAULT_MATCH_CARD_COMPACT: ResolvedMatchCardStyle = {
  width: NODE_DIMENSIONS_COMPACT.WIDTH,
  height: NODE_DIMENSIONS_COMPACT.HEIGHT,
  borderRadius: 8,
  insetX: 6,
  badgeSize: 16,
  badgePad: 4,
  badgeFontSize: 8,
  nameFontSize: 10,
  matchCountWidth: 14,
  matchCountTrailingGap: 6,
  scoreGroupTrailingGap: 4,
  rowPadding: '4px 6px',
  rowGap: 4,
  score: { ...SCORE_LAYOUT_COMPACT },
};

const DEFAULT_MATCH_CARD_STANDARD: ResolvedMatchCardStyle = {
  width: NODE_DIMENSIONS.WIDTH,
  height: NODE_DIMENSIONS.HEIGHT,
  borderRadius: 14,
  insetX: 10,
  badgeSize: 24,
  badgePad: 6,
  badgeFontSize: 12,
  nameFontSize: 13,
  matchCountWidth: 20,
  matchCountTrailingGap: 8,
  scoreGroupTrailingGap: 4,
  rowPadding: '8px 10px',
  rowGap: 5,
  score: { ...SCORE_LAYOUT_DEFAULT },
};

const DEFAULT_FRAME: BracketFrameAppearance = {
  maxWidth: 1180,
  borderRadiusCompact: 10,
  borderRadiusStandard: 24,
  contentPaddingCompact: '4px 8px 8px',
  contentPaddingStandard: '12px 24px 24px',
  canvasBackgroundLight:
    'radial-gradient(circle at top left, rgba(124, 144, 112, 0.08), transparent 28%), #f7f6f3',
  canvasBackgroundDark:
    'radial-gradient(circle at top left, rgba(154, 176, 141, 0.08), transparent 28%), #191e24',
};

const DEFAULT_HEADER: BracketHeaderAppearance = {
  gap: 14,
  minHeightCompact: 40,
  minHeightStandard: 72,
  paddingCompact: '0 12px',
  paddingStandard: '0 32px',
  iconSizeCompact: 18,
  iconSizeStandard: 30,
  iconRadiusCompact: 4,
  iconRadiusStandard: 8,
  titleFontSizeCompact: 13,
  titleFontSizeStandard: 18,
  badgeFontSizeCompact: 9,
  badgeFontSizeStandard: 11,
  badgePaddingCompact: '0 7px',
  badgePaddingStandard: '0 14px',
  badgeDotSize: 6,
};

const DEFAULT_STAGE_LABELS: BracketStageLabelsAppearance = {
  backgroundLight: '#fbfaf7',
  backgroundDark: '#20262d',
  paddingCompact: '5px 12px',
  paddingStandard: '14px 32px 12px',
  paddingNavigationCompact: '5px 10px',
  paddingNavigationStandard: '8px 16px',
  gridGapCompact: 8,
  gridGapStandard: 24,
  labelFontSizeCompact: 10,
  labelFontSizeStandard: 12,
  activePillFontSizeCompact: 10,
  activePillFontSizeStandard: 11,
  activePillPaddingCompact: '4px 12px',
  activePillPaddingStandard: '5px 16px',
  counterFontSizeCompact: 10,
  counterFontSizeStandard: 12,
  navColorLight: '#3f4a38',
  navColorDark: '#f7f5ef',
  navBorderLight: '#ddd7cb',
  navBorderDark: '#46505c',
};

const DEFAULT_TYPOGRAPHY: BracketTypographyAppearance = {
  bodyFontFamily: BODY_FONT_FAMILY,
  scoreFontFamily: SCORE_FONT_FAMILY,
};

const mergeThemeColors = (
  base: SquashThemeColors,
  overrides?: SquashThemeColorsOverrides
): SquashThemeColors => ({
  ...base,
  ...overrides,
});

const mergeScoreStyle = (
  base: ResolvedMatchCardScoreStyle,
  override?: MatchCardScoreAppearance
): ResolvedMatchCardScoreStyle => ({
  segmentWidth: override?.segmentWidth ?? base.segmentWidth,
  segmentGap: override?.segmentGap ?? base.segmentGap,
  fontSize: override?.fontSize ?? base.fontSize,
  matchCountFontSize: override?.matchCountFontSize ?? base.matchCountFontSize,
});

const mergeMatchCardStyle = (
  base: ResolvedMatchCardStyle,
  override?: MatchCardAppearance
): ResolvedMatchCardStyle => ({
  width: override?.width ?? base.width,
  height: override?.height ?? base.height,
  borderRadius: override?.borderRadius ?? base.borderRadius,
  insetX: override?.insetX ?? base.insetX,
  badgeSize: override?.badgeSize ?? base.badgeSize,
  badgePad: override?.badgePad ?? base.badgePad,
  badgeFontSize: override?.badgeFontSize ?? base.badgeFontSize,
  nameFontSize: override?.nameFontSize ?? base.nameFontSize,
  matchCountWidth: override?.matchCountWidth ?? base.matchCountWidth,
  matchCountTrailingGap: override?.matchCountTrailingGap ?? base.matchCountTrailingGap,
  scoreGroupTrailingGap: override?.scoreGroupTrailingGap ?? base.scoreGroupTrailingGap,
  rowPadding: override?.rowPadding ?? base.rowPadding,
  rowGap: override?.rowGap ?? base.rowGap,
  score: mergeScoreStyle(base.score, override?.score),
});

const pickDensity = <T,>(
  compact: boolean,
  compactValue: T,
  standardValue: T
): T => (compact ? compactValue : standardValue);

const resolveFrameStyle = (
  frame: BracketFrameAppearance | undefined,
  compact: boolean,
  isDarkMode: boolean
): ResolvedBracketFrameStyle => ({
  maxWidth: frame?.maxWidth ?? DEFAULT_FRAME.maxWidth ?? 1180,
  borderRadius: pickDensity(
    compact,
    frame?.borderRadiusCompact ?? DEFAULT_FRAME.borderRadiusCompact ?? 10,
    frame?.borderRadiusStandard ?? DEFAULT_FRAME.borderRadiusStandard ?? 24
  ),
  contentPadding: pickDensity(
    compact,
    frame?.contentPaddingCompact ?? DEFAULT_FRAME.contentPaddingCompact ?? '4px 8px 8px',
    frame?.contentPaddingStandard ?? DEFAULT_FRAME.contentPaddingStandard ?? '12px 24px 24px'
  ),
  canvasBackground: isDarkMode
    ? (frame?.canvasBackgroundDark ?? DEFAULT_FRAME.canvasBackgroundDark ?? '#191e24')
    : (frame?.canvasBackgroundLight ?? DEFAULT_FRAME.canvasBackgroundLight ?? '#f7f6f3'),
});

const resolveHeaderStyle = (
  header: BracketHeaderAppearance | undefined,
  compact: boolean
): ResolvedBracketHeaderStyle => ({
  gap: header?.gap ?? DEFAULT_HEADER.gap ?? 14,
  minHeight: pickDensity(
    compact,
    header?.minHeightCompact ?? DEFAULT_HEADER.minHeightCompact ?? 40,
    header?.minHeightStandard ?? DEFAULT_HEADER.minHeightStandard ?? 72
  ),
  padding: pickDensity(
    compact,
    header?.paddingCompact ?? DEFAULT_HEADER.paddingCompact ?? '0 12px',
    header?.paddingStandard ?? DEFAULT_HEADER.paddingStandard ?? '0 32px'
  ),
  iconSize: pickDensity(
    compact,
    header?.iconSizeCompact ?? DEFAULT_HEADER.iconSizeCompact ?? 18,
    header?.iconSizeStandard ?? DEFAULT_HEADER.iconSizeStandard ?? 30
  ),
  iconRadius: pickDensity(
    compact,
    header?.iconRadiusCompact ?? DEFAULT_HEADER.iconRadiusCompact ?? 4,
    header?.iconRadiusStandard ?? DEFAULT_HEADER.iconRadiusStandard ?? 8
  ),
  titleFontSize: pickDensity(
    compact,
    header?.titleFontSizeCompact ?? DEFAULT_HEADER.titleFontSizeCompact ?? 13,
    header?.titleFontSizeStandard ?? DEFAULT_HEADER.titleFontSizeStandard ?? 18
  ),
  badgeFontSize: pickDensity(
    compact,
    header?.badgeFontSizeCompact ?? DEFAULT_HEADER.badgeFontSizeCompact ?? 9,
    header?.badgeFontSizeStandard ?? DEFAULT_HEADER.badgeFontSizeStandard ?? 11
  ),
  badgePadding: pickDensity(
    compact,
    header?.badgePaddingCompact ?? DEFAULT_HEADER.badgePaddingCompact ?? '0 7px',
    header?.badgePaddingStandard ?? DEFAULT_HEADER.badgePaddingStandard ?? '0 14px'
  ),
  badgeDotSize: header?.badgeDotSize ?? DEFAULT_HEADER.badgeDotSize ?? 6,
});

const resolveStageLabelsStyle = (
  stageLabels: BracketStageLabelsAppearance | undefined,
  compact: boolean,
  isDarkMode: boolean
): ResolvedBracketStageLabelsStyle => ({
  background: isDarkMode
    ? (stageLabels?.backgroundDark ?? DEFAULT_STAGE_LABELS.backgroundDark ?? '#20262d')
    : (stageLabels?.backgroundLight ?? DEFAULT_STAGE_LABELS.backgroundLight ?? '#fbfaf7'),
  padding: pickDensity(
    compact,
    stageLabels?.paddingCompact ?? DEFAULT_STAGE_LABELS.paddingCompact ?? '5px 12px',
    stageLabels?.paddingStandard ?? DEFAULT_STAGE_LABELS.paddingStandard ?? '14px 32px 12px'
  ),
  paddingNavigation: pickDensity(
    compact,
    stageLabels?.paddingNavigationCompact ?? DEFAULT_STAGE_LABELS.paddingNavigationCompact ?? '5px 10px',
    stageLabels?.paddingNavigationStandard ??
      DEFAULT_STAGE_LABELS.paddingNavigationStandard ??
      '8px 16px'
  ),
  gridGap: pickDensity(
    compact,
    stageLabels?.gridGapCompact ?? DEFAULT_STAGE_LABELS.gridGapCompact ?? 8,
    stageLabels?.gridGapStandard ?? DEFAULT_STAGE_LABELS.gridGapStandard ?? 24
  ),
  labelFontSize: pickDensity(
    compact,
    stageLabels?.labelFontSizeCompact ?? DEFAULT_STAGE_LABELS.labelFontSizeCompact ?? 10,
    stageLabels?.labelFontSizeStandard ?? DEFAULT_STAGE_LABELS.labelFontSizeStandard ?? 12
  ),
  activePillFontSize: pickDensity(
    compact,
    stageLabels?.activePillFontSizeCompact ?? DEFAULT_STAGE_LABELS.activePillFontSizeCompact ?? 10,
    stageLabels?.activePillFontSizeStandard ?? DEFAULT_STAGE_LABELS.activePillFontSizeStandard ?? 11
  ),
  activePillPadding: pickDensity(
    compact,
    stageLabels?.activePillPaddingCompact ?? DEFAULT_STAGE_LABELS.activePillPaddingCompact ?? '4px 12px',
    stageLabels?.activePillPaddingStandard ??
      DEFAULT_STAGE_LABELS.activePillPaddingStandard ??
      '5px 16px'
  ),
  counterFontSize: pickDensity(
    compact,
    stageLabels?.counterFontSizeCompact ?? DEFAULT_STAGE_LABELS.counterFontSizeCompact ?? 10,
    stageLabels?.counterFontSizeStandard ?? DEFAULT_STAGE_LABELS.counterFontSizeStandard ?? 12
  ),
  navColor: isDarkMode
    ? (stageLabels?.navColorDark ?? DEFAULT_STAGE_LABELS.navColorDark ?? '#f7f5ef')
    : (stageLabels?.navColorLight ?? DEFAULT_STAGE_LABELS.navColorLight ?? '#3f4a38'),
  navBorder: isDarkMode
    ? (stageLabels?.navBorderDark ?? DEFAULT_STAGE_LABELS.navBorderDark ?? '#46505c')
    : (stageLabels?.navBorderLight ?? DEFAULT_STAGE_LABELS.navBorderLight ?? '#ddd7cb'),
});

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
  const typography = {
    bodyFontFamily:
      appearance?.typography?.bodyFontFamily ?? DEFAULT_TYPOGRAPHY.bodyFontFamily ?? BODY_FONT_FAMILY,
    scoreFontFamily:
      appearance?.typography?.scoreFontFamily ??
      DEFAULT_TYPOGRAPHY.scoreFontFamily ??
      SCORE_FONT_FAMILY,
  };

  return {
    mode,
    compact,
    colors: mergeThemeColors(baseColors, colorOverrides),
    typography,
    matchCard: mergeMatchCardStyle(matchCardBase, matchCardOverride),
    frame: resolveFrameStyle(appearance?.frame, compact, isDarkMode),
    header: resolveHeaderStyle(appearance?.header, compact),
    stageLabels: resolveStageLabelsStyle(appearance?.stageLabels, compact, isDarkMode),
  };
}
