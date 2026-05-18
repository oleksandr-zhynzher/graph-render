import { describe, expect, it } from 'vitest';

import { escapeXml, sanitizeCssColor, sanitizeFontFamily, sanitizeSvgId } from '../utils';

describe('escapeXml', () => {
  it('replaces & with &amp;', () => {
    expect(escapeXml('a & b')).toBe('a &amp; b');
  });

  it('replaces < with &lt;', () => {
    expect(escapeXml('<tag>')).toBe('&lt;tag&gt;');
  });

  it('replaces > with &gt;', () => {
    expect(escapeXml('a > b')).toBe('a &gt; b');
  });

  it('replaces " with &quot;', () => {
    expect(escapeXml('"hello"')).toBe('&quot;hello&quot;');
  });

  it("replaces ' with &apos;", () => {
    expect(escapeXml("it's")).toBe('it&apos;s');
  });

  it('handles a string with all special characters', () => {
    expect(escapeXml('<a & "b\'>c')).toBe('&lt;a &amp; &quot;b&apos;&gt;c');
  });

  it('returns empty string for null', () => {
    expect(escapeXml(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(escapeXml(undefined)).toBe('');
  });

  it('converts numbers to string', () => {
    expect(escapeXml(42)).toBe('42');
  });
});

describe('sanitizeSvgId', () => {
  it('returns the id unchanged when valid', () => {
    expect(sanitizeSvgId('my-id', 'fallback')).toBe('my-id');
  });

  it('returns the fallback when input is empty', () => {
    expect(sanitizeSvgId('', 'fallback')).toBe('fallback');
  });

  it('replaces invalid characters with hyphens', () => {
    const result = sanitizeSvgId('hello world!', 'fb');
    expect(result).toBe('hello-world');
  });

  it('prepends fallback when id starts with a digit', () => {
    const result = sanitizeSvgId('123', 'fb');
    expect(result).toBe('fb-123');
  });

  it('strips leading and trailing hyphens', () => {
    const result = sanitizeSvgId('---hello---', 'fb');
    expect(result).toBe('hello');
  });

  it('returns fallback for whitespace-only input', () => {
    expect(sanitizeSvgId('   ', 'fallback')).toBe('fallback');
  });
});

describe('sanitizeCssColor', () => {
  it('accepts a hex color', () => {
    expect(sanitizeCssColor('#ff0000', 'black')).toBe('#ff0000');
  });

  it('accepts rgb() color', () => {
    expect(sanitizeCssColor('rgb(0,0,0)', 'black')).toBe('rgb(0,0,0)');
  });

  it('accepts named colors', () => {
    expect(sanitizeCssColor('red', 'black')).toBe('red');
  });

  it('returns fallback for empty input', () => {
    expect(sanitizeCssColor('', 'black')).toBe('black');
  });

  it('returns fallback for invalid color strings', () => {
    expect(sanitizeCssColor('<script>', 'black')).toBe('black');
  });

  it('returns fallback for null/undefined', () => {
    expect(sanitizeCssColor(null, 'black')).toBe('black');
    expect(sanitizeCssColor(undefined, 'black')).toBe('black');
  });
});

describe('sanitizeFontFamily', () => {
  const FALLBACK_FONT_FAMILY = 'sans-serif';

  it('accepts a simple font family', () => {
    expect(sanitizeFontFamily('Arial', FALLBACK_FONT_FAMILY)).toBe('Arial');
  });

  it('accepts a font family with fallbacks', () => {
    expect(sanitizeFontFamily('Helvetica, Arial, sans-serif', FALLBACK_FONT_FAMILY)).toBe(
      'Helvetica, Arial, sans-serif'
    );
  });

  it('returns fallback for empty string', () => {
    expect(sanitizeFontFamily('', FALLBACK_FONT_FAMILY)).toBe(FALLBACK_FONT_FAMILY);
  });

  it('returns fallback for null', () => {
    expect(sanitizeFontFamily(null, FALLBACK_FONT_FAMILY)).toBe(FALLBACK_FONT_FAMILY);
  });

  it('returns fallback for invalid font family with XSS payload', () => {
    expect(sanitizeFontFamily('<script>alert(1)</script>', FALLBACK_FONT_FAMILY)).toBe(
      FALLBACK_FONT_FAMILY
    );
  });
});
