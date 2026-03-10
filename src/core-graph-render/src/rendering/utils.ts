export const escapeXml = (input: unknown): string => {
  const str = String(input ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const CSS_COLOR_PATTERN =
  /^(#[0-9a-fA-F]{3,8}|(?:rgb|hsl)a?\([0-9\s.,%+-]+\)|[a-zA-Z][a-zA-Z0-9-]*|var\(--[a-zA-Z0-9-_]+\))$/;

const FONT_FAMILY_PATTERN = /^[a-zA-Z0-9\s,'"-]+$/;

export const sanitizeSvgId = (input: unknown, fallback: string): string => {
  const normalized = String(input ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9:_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!normalized) {
    return fallback;
  }

  return /^[a-zA-Z_]/.test(normalized) ? normalized : `${fallback}-${normalized}`;
};

export const sanitizeCssColor = (input: unknown, fallback: string): string => {
  const value = String(input ?? '').trim();
  return CSS_COLOR_PATTERN.test(value) ? value : fallback;
};

export const sanitizeFontFamily = (input: unknown, fallback: string): string => {
  const value = String(input ?? '').trim();
  if (!value || !FONT_FAMILY_PATTERN.test(value)) {
    return fallback;
  }

  return value;
};
