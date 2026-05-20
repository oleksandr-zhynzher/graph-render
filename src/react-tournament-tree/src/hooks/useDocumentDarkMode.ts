import { useCallback, useState, useSyncExternalStore } from 'react';

import { detectDocumentDarkMode } from '../utils/documentTheme';

const subscribeToDocumentTheme = (onStoreChange: () => void) => {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
    return () => undefined;
  }

  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'style'],
  });
  const body = document.body;
  if (body) {
    observer.observe(body, { attributes: true, attributeFilter: ['class'] });
  }

  return () => observer.disconnect();
};

const getDocumentThemeSnapshot = () => detectDocumentDarkMode();

export interface UseDocumentDarkModeOptions {
  /**
   * When true, toggling dark mode updates `document.documentElement` class `dark`.
   * Defaults to false so embedded brackets do not fight app-level theme providers.
   */
  readonly syncToDocument?: boolean | undefined;
  /** Controlled dark mode (skips internal state). */
  readonly isDarkMode?: boolean | undefined;
  /** Initial uncontrolled dark mode before document theme changes are observed. */
  readonly defaultDarkMode?: boolean | undefined;
  readonly onDarkModeChange?: ((isDarkMode: boolean) => void) | undefined;
}

export function useDocumentDarkMode(options: UseDocumentDarkModeOptions = {}) {
  const {
    syncToDocument = false,
    defaultDarkMode,
    isDarkMode: controlledDarkMode,
    onDarkModeChange,
  } = options;
  const documentDarkMode = useSyncExternalStore(
    subscribeToDocumentTheme,
    getDocumentThemeSnapshot,
    () => false
  );

  const [localOverride, setLocalOverride] = useState<boolean | null>(() => defaultDarkMode ?? null);
  const isDarkMode = controlledDarkMode ?? localOverride ?? documentDarkMode;

  const toggleDarkMode = useCallback(() => {
    const next = !isDarkMode;
    if (controlledDarkMode === undefined) {
      setLocalOverride(next);
    }
    if (syncToDocument && typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next);
    }
    onDarkModeChange?.(next);
  }, [controlledDarkMode, isDarkMode, onDarkModeChange, syncToDocument]);

  return { isDarkMode, toggleDarkMode };
}
