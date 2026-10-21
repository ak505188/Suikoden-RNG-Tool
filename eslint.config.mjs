import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'build/**',
      'node_modules/**',
      // Unused and not valid JS (TypeScript syntax / stray top-level return)
      'src/shared/table/interfaces.js',
      'src/shared/search-attempt-table/**',
      'src/features/chinchironin/cursor.js',
    ],
  },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  { settings: { react: { version: 'detect' } } },
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^React$' }],
    },
  },
  {
    files: ['src/**/*.test.{js,jsx}'],
    languageOptions: { globals: globals.vitest ?? globals.node },
  },
  {
    files: ['*.config.{js,mjs}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['public/**/*.js'],
    languageOptions: { globals: globals.serviceworker },
  },
  prettier,
];
