import React from 'react';

import { THEME_COLORS_DARK, THEME_COLORS_LIGHT } from '../constants';

export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
}

type ThemeColors = typeof THEME_COLORS_LIGHT | typeof THEME_COLORS_DARK;

interface BracketThemeContextValue {
  readonly mode: ThemeMode;
  readonly colors: ThemeColors;
}

const BracketThemeContext = React.createContext<BracketThemeContextValue>({
  mode: ThemeMode.Light,
  colors: THEME_COLORS_LIGHT,
});

export const useBracketTheme = () => React.useContext(BracketThemeContext);

interface BracketThemeProviderProps {
  readonly mode: ThemeMode;
  readonly children: React.ReactNode;
}

export const BracketThemeProvider: React.FC<BracketThemeProviderProps> = ({ mode, children }) => {
  const value = React.useMemo(
    () => ({
      mode,
      colors: mode === ThemeMode.Dark ? THEME_COLORS_DARK : THEME_COLORS_LIGHT,
    }),
    [mode]
  );

  return <BracketThemeContext.Provider value={value}>{children}</BracketThemeContext.Provider>;
};
