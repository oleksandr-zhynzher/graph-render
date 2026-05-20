import type { SquashThemeColors } from '@graph-render/types/tournament';

import type { ThemeMode } from '../constants/themeMode';

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
