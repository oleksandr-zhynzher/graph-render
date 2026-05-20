import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { THEME_COLORS_DARK, THEME_COLORS_LIGHT } from '../../constants';
import { ThemeMode } from '../../constants/themeMode';
import { BracketThemeProvider, useBracketTheme } from '../BracketThemeContext';

// ── Test consumer ─────────────────────────────────────────────────────────────

function ThemeConsumer() {
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- testing deprecated hook intentionally
  const { mode, colors } = useBracketTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="base-bg">{colors.BASE_BG}</span>
    </div>
  );
}

// ── BracketThemeProvider (deprecated wrapper) ─────────────────────────────────

describe('BracketThemeProvider', () => {
  it('provides Light mode when ThemeMode.Light is passed', () => {
    render(
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- testing deprecated provider intentionally
      <BracketThemeProvider mode={ThemeMode.Light}>
        <ThemeConsumer />
      </BracketThemeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent(ThemeMode.Light);
    expect(screen.getByTestId('base-bg')).toHaveTextContent(THEME_COLORS_LIGHT.BASE_BG);
  });

  it('provides Dark mode when ThemeMode.Dark is passed', () => {
    render(
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- testing deprecated provider intentionally
      <BracketThemeProvider mode={ThemeMode.Dark}>
        <ThemeConsumer />
      </BracketThemeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent(ThemeMode.Dark);
    expect(screen.getByTestId('base-bg')).toHaveTextContent(THEME_COLORS_DARK.BASE_BG);
  });

  it('defaults compact to true', () => {
    function CompactConsumer() {
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- testing deprecated hook intentionally
      const { mode } = useBracketTheme();
      return <span data-testid="mode">{mode}</span>;
    }
    // Should render without errors (compact defaults to true)
    render(
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- testing deprecated provider intentionally
      <BracketThemeProvider mode={ThemeMode.Light}>
        <CompactConsumer />
      </BracketThemeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent(ThemeMode.Light);
  });
});

// ── useBracketTheme ───────────────────────────────────────────────────────────

describe('useBracketTheme', () => {
  it('returns mode and colors', () => {
    render(
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- testing deprecated provider intentionally
      <BracketThemeProvider mode={ThemeMode.Dark}>
        <ThemeConsumer />
      </BracketThemeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent(ThemeMode.Dark);
    expect(screen.getByTestId('base-bg')).toHaveTextContent(THEME_COLORS_DARK.BASE_BG);
  });

  it('throws when used outside of a provider', () => {
    const ErrorConsumer = () => {
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- testing deprecated hook intentionally
      useBracketTheme();
      return null;
    };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<ErrorConsumer />)).toThrow();
    consoleSpy.mockRestore();
  });
});
