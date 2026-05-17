import type { TournamentBracketAppearance } from '@graph-render/types';
import type React from 'react';

import { ThemeMode } from '../constants/themeMode';
import { BracketAppearanceProvider, useBracketAppearance } from './BracketAppearanceContext';

export { ThemeMode } from '../constants/themeMode';

/**
 * @deprecated Prefer {@link BracketAppearanceProvider} with `appearance`, `isDarkMode`, and `compact`.
 */
export const BracketThemeProvider: React.FC<{
  readonly mode: ThemeMode;
  readonly compact?: boolean | undefined;
  readonly appearance?: TournamentBracketAppearance | undefined;
  readonly children: React.ReactNode;
}> = ({ mode, compact = true, appearance, children }) => (
  <BracketAppearanceProvider
    appearance={appearance}
    isDarkMode={mode === ThemeMode.Dark}
    compact={compact}
  >
    {children}
  </BracketAppearanceProvider>
);

/** @deprecated Use {@link useBracketAppearance} for full styling; this remains for color/mode only. */
export function useBracketTheme(): {
  readonly mode: ThemeMode;
  readonly colors: ReturnType<typeof useBracketAppearance>['colors'];
} {
  const { mode, colors } = useBracketAppearance();
  return { mode, colors };
}
