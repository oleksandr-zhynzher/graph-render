/** @type {import('@commitlint/types').UserConfig} */
// body-max-line-length and footer-max-line-length are disabled because any
// commit body containing a URL (e.g. issue refs, links) will exceed 100 chars.
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
    // Enforce allowed commit types
    'type-enum': [
      2,
      'always',
      [
        'feat', // new feature          → minor bump (or major if breaking)
        'fix', // bug fix              → patch bump
        'perf', // performance          → patch bump
        'revert', // revert a commit      → patch bump
        'refactor', // code change, no fix  → no bump
        'docs', // documentation only   → no bump
        'style', // formatting only      → no bump
        'test', // test changes         → no bump
        'chore', // maintenance          → no bump
        'build', // build system changes → no bump
        'ci', // CI config changes    → no bump
      ],
    ],
    // Scope is optional but when provided must match a known package or area
    'scope-enum': [
      1, // 1 = warn, use 2 to make it an error
      'always',
      ['core', 'react', 'bracket', 'types', 'deps', 'release'],
    ],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 100],
  },
};
