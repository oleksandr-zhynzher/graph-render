export function detectDocumentDarkMode(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const root = document.documentElement;
  const body = document.body;
  return Boolean(root?.classList.contains('dark') || body?.classList.contains('dark'));
}
