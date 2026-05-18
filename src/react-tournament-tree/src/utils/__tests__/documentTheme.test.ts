import { afterEach, describe, expect, it } from 'vitest';

import { detectDocumentDarkMode } from '../documentTheme';

describe('detectDocumentDarkMode', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  });

  it('returns false when neither html nor body has the "dark" class', () => {
    expect(detectDocumentDarkMode()).toBe(false);
  });

  it('returns true when the html element has the "dark" class', () => {
    document.documentElement.classList.add('dark');
    expect(detectDocumentDarkMode()).toBe(true);
  });

  it('returns true when the body element has the "dark" class', () => {
    document.body.classList.add('dark');
    expect(detectDocumentDarkMode()).toBe(true);
  });

  it('returns true when both html and body have the "dark" class', () => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    expect(detectDocumentDarkMode()).toBe(true);
  });

  it('is case-sensitive — "Dark" does not match', () => {
    document.documentElement.classList.add('Dark');
    expect(detectDocumentDarkMode()).toBe(false);
    document.documentElement.classList.remove('Dark');
  });
});
