const antfu = require('@antfu/eslint-config').default

module.exports = antfu({
  ingores: [
    '.vscode',
    'dist',
    'node_modules',
    'public',
    '*.md',
  ],
}, {
  rules: {
    '@typescript-eslint/brace-style': 'off',
    'vue/comma-dangle': 'off',
    'vue/dot-location': 'off',
  },
})
