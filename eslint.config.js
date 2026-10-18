import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import stylistic from '@stylistic/eslint-plugin'

export default [
  { ignores: ['dist', 'node_modules'] },

  js.configs.recommended,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,

  // Formatting: 2-space indent, single quotes, no semicolons (the project's existing style).
  // Code snippets inside c`...` template literals are left untouched.
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    jsx: true,
    braceStyle: '1tbs',
    arrowParens: false,
    commaDangle: 'always-multiline',
  }),

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // aligned trailing comments and one-line data objects are intentional in the sheets
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: 'always' }],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      'no-empty': ['error', { allowEmptyCatch: true }],
      '@stylistic/no-multi-spaces': ['error', { ignoreEOLComments: true }],
      '@stylistic/max-statements-per-line': 'off',
      '@stylistic/multiline-ternary': 'off',
      '@stylistic/jsx-one-expression-per-line': 'off',
    },
  },

  // Sheets: one property per line, so every item reads top to bottom
  {
    files: ['src/data/sheets/**/*.js'],
    rules: {
      '@stylistic/object-curly-newline': ['error', { ObjectExpression: { multiline: true, minProperties: 2, consistent: true } }],
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: false }],
    },
  },

  // Context modules export a provider component and its hook together, which is fine
  {
    files: ['src/hooks/**/*.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
]
