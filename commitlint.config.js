module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'feature',
        'fix',
        'docs',
        'style',
        'refactor',
        'test',
        'chore',
        'perf',
        'ci',
        'build',
        'prune',
        'quickfix',
        'revert',
      ],
    ],
    'subject-max-length': [2, 'always', 72],
    'header-max-length': [2, 'always', 100],
    'subject-empty': [0, 'never'],
    'type-empty': [0, 'never'],
  },
}
