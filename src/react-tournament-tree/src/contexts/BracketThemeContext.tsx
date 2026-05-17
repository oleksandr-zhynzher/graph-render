import type { TournamentBracketAppearance } from '@graph-render/types';
import React from 'react';

import { ThemeMode } from '../constants/themeMode';
import { BracketAppearanceProvider } from './BracketAppearanceContext';

export { ThemeMode } from '../constants/themeMode';
export {
  BracketAppearanceProvider,
  useBracketAppearance,
  useBracketTheme,
} from './BracketAppearanceContext';

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
