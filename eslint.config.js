import js from '@eslint/js';
import globals from 'globals';
import prettierPlugin from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['**/*.d.ts', 'src/domain/enums'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      js,
      prettier: prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      'prettier/prettier': 'error',
      'no-undef': 'off',
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
    },
  },
]);
