import type {
  BracketFrameAppearance,
  BracketHeaderAppearance,
  BracketStageLabelsAppearance,
  MatchCardAppearance,
  MatchCardScoreAppearance,
  SquashThemeColors,
  SquashThemeColorsOverrides,
} from '@graph-render/types/tournament';

import {
  DEFAULT_FRAME,
  DEFAULT_HEADER,
  DEFAULT_STAGE_LABELS,
} from '../constants/bracketAppearanceDefaults';
import type {
  ResolvedBracketFrameStyle,
  ResolvedBracketHeaderStyle,
  ResolvedBracketStageLabelsStyle,
  ResolvedMatchCardScoreStyle,
  ResolvedMatchCardStyle,
} from '../models/bracketAppearanceResolved';

export const mergeThemeColors = (
  base: SquashThemeColors,
  overrides?: SquashThemeColorsOverrides
): SquashThemeColors => ({
  ...base,
  ...overrides,
});

export const mergeScoreStyle = (
  base: ResolvedMatchCardScoreStyle,
  override?: MatchCardScoreAppearance
): ResolvedMatchCardScoreStyle => ({
  segmentWidth: override?.segmentWidth ?? base.segmentWidth,
  segmentGap: override?.segmentGap ?? base.segmentGap,
  fontSize: override?.fontSize ?? base.fontSize,
  matchCountFontSize: override?.matchCountFontSize ?? base.matchCountFontSize,
});

export const mergeMatchCardStyle = (
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

export const pickDensity = <T>(compact: boolean, compactValue: T, standardValue: T): T =>
  compact ? compactValue : standardValue;

export const resolveFrameStyle = (
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

export const resolveHeaderStyle = (
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

export const resolveStageLabelsStyle = (
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
    stageLabels?.paddingNavigationCompact ??
      DEFAULT_STAGE_LABELS.paddingNavigationCompact ??
      '5px 10px',
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
    stageLabels?.activePillPaddingCompact ??
      DEFAULT_STAGE_LABELS.activePillPaddingCompact ??
      '4px 12px',
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
