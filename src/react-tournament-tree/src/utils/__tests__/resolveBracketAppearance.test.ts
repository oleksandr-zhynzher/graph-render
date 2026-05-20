import { describe, expect, it } from 'vitest';

import {
  BODY_FONT_FAMILY,
  NODE_DIMENSIONS,
  NODE_DIMENSIONS_COMPACT,
  SCORE_FONT_FAMILY,
  THEME_COLORS_DARK,
  THEME_COLORS_LIGHT,
} from '../../constants';
import { ThemeMode } from '../../constants/themeMode';
import { resolveBracketAppearance } from '../resolveBracketAppearance';

// ── resolveBracketAppearance ──────────────────────────────────────────────────

describe('resolveBracketAppearance', () => {
  describe('mode and compact flags', () => {
    it('sets mode to Light when isDarkMode is false', () => {
      const result = resolveBracketAppearance(undefined, false, false);
      expect(result.mode).toBe(ThemeMode.Light);
    });

    it('sets mode to Dark when isDarkMode is true', () => {
      const result = resolveBracketAppearance(undefined, true, false);
      expect(result.mode).toBe(ThemeMode.Dark);
    });

    it('reflects the compact flag', () => {
      expect(resolveBracketAppearance(undefined, false, true).compact).toBe(true);
      expect(resolveBracketAppearance(undefined, false, false).compact).toBe(false);
    });
  });

  describe('colors', () => {
    it('uses THEME_COLORS_LIGHT base in light mode', () => {
      const result = resolveBracketAppearance(undefined, false, false);
      expect(result.colors.BASE_BG).toBe(THEME_COLORS_LIGHT.BASE_BG);
    });

    it('uses THEME_COLORS_DARK base in dark mode', () => {
      const result = resolveBracketAppearance(undefined, true, false);
      expect(result.colors.BASE_BG).toBe(THEME_COLORS_DARK.BASE_BG);
    });

    it('merges light color overrides in light mode', () => {
      const appearance = { colors: { light: { BASE_BG: '#custom-light' } } };
      const result = resolveBracketAppearance(appearance, false, false);
      expect(result.colors.BASE_BG).toBe('#custom-light');
    });

    it('merges dark color overrides in dark mode', () => {
      const appearance = { colors: { dark: { BASE_BG: '#custom-dark' } } };
      const result = resolveBracketAppearance(appearance, true, false);
      expect(result.colors.BASE_BG).toBe('#custom-dark');
    });
  });

  describe('typography', () => {
    it('uses default body font family', () => {
      const result = resolveBracketAppearance(undefined, false, false);
      expect(result.typography.bodyFontFamily).toBe(BODY_FONT_FAMILY);
    });

    it('uses default score font family', () => {
      const result = resolveBracketAppearance(undefined, false, false);
      expect(result.typography.scoreFontFamily).toBe(SCORE_FONT_FAMILY);
    });

    it('uses override body font family when provided', () => {
      const appearance = { typography: { bodyFontFamily: 'Comic Sans' } };
      const result = resolveBracketAppearance(appearance, false, false);
      expect(result.typography.bodyFontFamily).toBe('Comic Sans');
    });
  });

  describe('matchCard dimensions', () => {
    it('uses standard dimensions in non-compact mode', () => {
      const result = resolveBracketAppearance(undefined, false, false);
      expect(result.matchCard.width).toBe(NODE_DIMENSIONS.WIDTH);
      expect(result.matchCard.height).toBe(NODE_DIMENSIONS.HEIGHT);
    });

    it('uses compact dimensions in compact mode', () => {
      const result = resolveBracketAppearance(undefined, false, true);
      expect(result.matchCard.width).toBe(NODE_DIMENSIONS_COMPACT.WIDTH);
      expect(result.matchCard.height).toBe(NODE_DIMENSIONS_COMPACT.HEIGHT);
    });

    it('applies standard matchCard overrides', () => {
      const appearance = { matchCard: { standard: { width: 999 } } };
      const result = resolveBracketAppearance(appearance, false, false);
      expect(result.matchCard.width).toBe(999);
    });

    it('applies compact matchCard overrides', () => {
      const appearance = { matchCard: { compact: { width: 88 } } };
      const result = resolveBracketAppearance(appearance, false, true);
      expect(result.matchCard.width).toBe(88);
    });
  });

  describe('frame styles', () => {
    it('uses dark canvas background in dark mode', () => {
      const result = resolveBracketAppearance(undefined, true, false);
      expect(result.frame.canvasBackground).toContain('#191e24');
    });

    it('uses light canvas background in light mode', () => {
      const result = resolveBracketAppearance(undefined, false, false);
      expect(result.frame.canvasBackground).toContain('#f7f6f3');
    });

    it('uses compact border radius in compact mode', () => {
      const result = resolveBracketAppearance(undefined, false, true);
      expect(result.frame.borderRadius).toBe(10);
    });

    it('uses standard border radius in non-compact mode', () => {
      const result = resolveBracketAppearance(undefined, false, false);
      expect(result.frame.borderRadius).toBe(24);
    });
  });

  describe('header styles', () => {
    it('uses compact min-height in compact mode', () => {
      const result = resolveBracketAppearance(undefined, false, true);
      expect(result.header.minHeight).toBe(40);
    });

    it('uses standard min-height in non-compact mode', () => {
      const result = resolveBracketAppearance(undefined, false, false);
      expect(result.header.minHeight).toBe(72);
    });

    it('uses gap from default header', () => {
      const result = resolveBracketAppearance(undefined, false, false);
      expect(result.header.gap).toBe(14);
    });
  });

  describe('stageLabels styles', () => {
    it('uses dark background in dark mode', () => {
      const result = resolveBracketAppearance(undefined, true, false);
      expect(result.stageLabels.background).toBe('#20262d');
    });

    it('uses light background in light mode', () => {
      const result = resolveBracketAppearance(undefined, false, false);
      expect(result.stageLabels.background).toBe('#fbfaf7');
    });

    it('uses compact grid gap in compact mode', () => {
      const result = resolveBracketAppearance(undefined, false, true);
      expect(result.stageLabels.gridGap).toBe(8);
    });

    it('uses standard grid gap in non-compact mode', () => {
      const result = resolveBracketAppearance(undefined, false, false);
      expect(result.stageLabels.gridGap).toBe(24);
    });

    it('uses dark nav color in dark mode', () => {
      const result = resolveBracketAppearance(undefined, true, false);
      expect(result.stageLabels.navColor).toBe('#f7f5ef');
    });
  });
});
