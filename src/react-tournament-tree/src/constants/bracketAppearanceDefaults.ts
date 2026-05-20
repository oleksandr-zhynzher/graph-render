import type {
  BracketFrameAppearance,
  BracketHeaderAppearance,
  BracketStageLabelsAppearance,
  BracketTypographyAppearance,
} from '@graph-render/types/tournament';

import type { ResolvedMatchCardStyle } from '../models/bracketAppearanceResolved';
import { NODE_DIMENSIONS, NODE_DIMENSIONS_COMPACT } from './node';
import {
  BODY_FONT_FAMILY,
  SCORE_FONT_FAMILY,
  SCORE_LAYOUT_COMPACT,
  SCORE_LAYOUT_DEFAULT,
} from './squashNode';

export const DEFAULT_MATCH_CARD_COMPACT: ResolvedMatchCardStyle = {
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

export const DEFAULT_MATCH_CARD_STANDARD: ResolvedMatchCardStyle = {
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

export const DEFAULT_FRAME: BracketFrameAppearance = {
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

export const DEFAULT_HEADER: BracketHeaderAppearance = {
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

export const DEFAULT_STAGE_LABELS: BracketStageLabelsAppearance = {
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

export const DEFAULT_TYPOGRAPHY: BracketTypographyAppearance = {
  bodyFontFamily: BODY_FONT_FAMILY,
  scoreFontFamily: SCORE_FONT_FAMILY,
};
