import type { TournamentBracketAppearance } from '@graph-render/types';
import React from 'react';

import { ThemeMode } from '../constants/themeMode';
import {
  resolveBracketAppearance,
  type ResolvedBracketAppearance,
} from '../utils/resolveBracketAppearance';

const BracketAppearanceContext = React.createContext<ResolvedBracketAppearance | null>(null);

export interface BracketAppearanceProviderProps {
  readonly appearance?: TournamentBracketAppearance | undefined;
  readonly isDarkMode: boolean;
  readonly compact: boolean;
  readonly children: React.ReactNode;
}

export const BracketAppearanceProvider: React.FC<BracketAppearanceProviderProps> = ({
  appearance,
  isDarkMode,
  compact,
  children,
}) => {
  const value = React.useMemo(
    () => resolveBracketAppearance(appearance, isDarkMode, compact),
    [appearance, compact, isDarkMode]
  );

  return (
    <BracketAppearanceContext.Provider value={value}>{children}</BracketAppearanceContext.Provider>
  );
};

export function useBracketAppearance(): ResolvedBracketAppearance {
  const context = React.useContext(BracketAppearanceContext);
  if (!context) {
    throw new Error('useBracketAppearance must be used within BracketAppearanceProvider');
  }

  return context;
}

/** @deprecated Use {@link useBracketAppearance} for full styling; this remains for color/mode only. */
export function useBracketTheme(): {
  readonly mode: ThemeMode;
  readonly colors: ResolvedBracketAppearance['colors'];
} {
  const { mode, colors } = useBracketAppearance();
  return { mode, colors };
}
