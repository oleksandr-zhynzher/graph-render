import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  NODE_DIMENSIONS,
  NODE_DIMENSIONS_COMPACT,
  THEME_COLORS_DARK,
  THEME_COLORS_LIGHT,
} from '../../constants';
import { ThemeMode } from '../../constants/themeMode';
import { BracketAppearanceProvider, useBracketAppearance } from '../BracketAppearanceContext';

// ── Test consumer component ───────────────────────────────────────────────────

function AppearanceConsumer() {
  const appearance = useBracketAppearance();
  return (
    <div>
      <span data-testid="mode">{appearance.mode}</span>
      <span data-testid="compact">{String(appearance.compact)}</span>
      <span data-testid="base-bg">{appearance.colors.BASE_BG}</span>
      <span data-testid="card-width">{appearance.matchCard.width}</span>
      <span data-testid="card-height">{appearance.matchCard.height}</span>
    </div>
  );
}

// ── BracketAppearanceProvider ─────────────────────────────────────────────────

describe('BracketAppearanceProvider', () => {
  it('provides light mode appearance to children', () => {
    render(
      <BracketAppearanceProvider isDarkMode={false} compact={false}>
        <AppearanceConsumer />
      </BracketAppearanceProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent(ThemeMode.Light);
    expect(screen.getByTestId('base-bg')).toHaveTextContent(THEME_COLORS_LIGHT.BASE_BG);
  });

  it('provides dark mode appearance to children', () => {
    render(
      <BracketAppearanceProvider isDarkMode compact={false}>
        <AppearanceConsumer />
      </BracketAppearanceProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent(ThemeMode.Dark);
    expect(screen.getByTestId('base-bg')).toHaveTextContent(THEME_COLORS_DARK.BASE_BG);
  });

  it('provides standard card dimensions when compact=false', () => {
    render(
      <BracketAppearanceProvider isDarkMode={false} compact={false}>
        <AppearanceConsumer />
      </BracketAppearanceProvider>
    );
    expect(screen.getByTestId('card-width')).toHaveTextContent(String(NODE_DIMENSIONS.WIDTH));
    expect(screen.getByTestId('card-height')).toHaveTextContent(String(NODE_DIMENSIONS.HEIGHT));
  });

  it('provides compact card dimensions when compact=true', () => {
    render(
      <BracketAppearanceProvider isDarkMode={false} compact>
        <AppearanceConsumer />
      </BracketAppearanceProvider>
    );
    expect(screen.getByTestId('card-width')).toHaveTextContent(
      String(NODE_DIMENSIONS_COMPACT.WIDTH)
    );
    expect(screen.getByTestId('card-height')).toHaveTextContent(
      String(NODE_DIMENSIONS_COMPACT.HEIGHT)
    );
  });

  it('reflects compact flag in the appearance value', () => {
    render(
      <BracketAppearanceProvider isDarkMode={false} compact>
        <AppearanceConsumer />
      </BracketAppearanceProvider>
    );
    expect(screen.getByTestId('compact')).toHaveTextContent('true');
  });
});

// ── useBracketAppearance ──────────────────────────────────────────────────────

describe('useBracketAppearance', () => {
  it('throws when used outside of BracketAppearanceProvider', () => {
    const ThrowingConsumer = () => {
      useBracketAppearance();
      return null;
    };

    // Suppress expected React error boundary console.error output in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<ThrowingConsumer />)).toThrow(
      'useBracketAppearance must be used within BracketAppearanceProvider'
    );
    consoleSpy.mockRestore();
  });
});
