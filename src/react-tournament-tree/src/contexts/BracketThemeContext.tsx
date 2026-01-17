import React from 'react';
import { THEME_COLORS_LIGHT, THEME_COLORS_DARK } from '../constants';

export type ThemeMode = 'light' | 'dark';

type ThemeColors = typeof THEME_COLORS_LIGHT | typeof THEME_COLORS_DARK;

interface BracketThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
}

const BracketThemeContext = React.createContext<BracketThemeContextValue>({
  mode: 'light',
  colors: THEME_COLORS_LIGHT,
});

export const useBracketTheme = () => React.useContext(BracketThemeContext);

interface BracketThemeProviderProps {
  mode: ThemeMode;
  children: React.ReactNode;
}

export const BracketThemeProvider: React.FC<BracketThemeProviderProps> = ({ mode, children }) => {
  const value = React.useMemo(
    () => ({
      mode,
      colors: mode === 'dark' ? THEME_COLORS_DARK : THEME_COLORS_LIGHT,
    }),
    [mode]
  );

  return <BracketThemeContext.Provider value={value}>{children}</BracketThemeContext.Provider>;
};
