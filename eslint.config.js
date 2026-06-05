import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

const sharedRules = {
  'no-unused-vars': ['error', {
    varsIgnorePattern: '^_',
    argsIgnorePattern: '^_',
    caughtErrorsIgnorePattern: '^_',
  }],
};

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'backend/node_modules']),
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      ...sharedRules,
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['backend/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'module',
    },
    rules: sharedRules,
  },
]);
