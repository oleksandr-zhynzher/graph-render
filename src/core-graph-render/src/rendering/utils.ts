import { CSS_COLOR_PATTERN, FONT_FAMILY_PATTERN } from '../utils/constants';

export const escapeXml = (input: unknown): string => {
  const str = String(input ?? '');
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
};

export const sanitizeSvgId = (input: unknown, fallback: string): string => {
  const normalized = String(input ?? '')
    .trim()
    .replaceAll(/[^\w:-]+/g, '-')
    .replaceAll(/^-+|-+$/g, '');

  if (!normalized) {
    return fallback;
  }

  return /^[_a-z]/i.test(normalized) ? normalized : `${fallback}-${normalized}`;
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
