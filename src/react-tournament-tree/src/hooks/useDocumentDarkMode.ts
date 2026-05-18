import { useCallback, useEffect, useState } from 'react';

import { detectDocumentDarkMode } from '../utils/documentTheme';

export function useDocumentDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(detectDocumentDarkMode);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
      return;
    }

    const sync = () => setIsDarkMode(detectDocumentDarkMode());
    const observer = new MutationObserver(sync);
    const root = document.documentElement;
    const body = document.body;

    observer.observe(root, { attributes: true, attributeFilter: ['class', 'style'] });
    if (body) {
      observer.observe(body, { attributes: true, attributeFilter: ['class'] });
    }
    sync();

    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next);
      }
      return next;
    });
  }, []);

  return { isDarkMode, toggleDarkMode };
}
