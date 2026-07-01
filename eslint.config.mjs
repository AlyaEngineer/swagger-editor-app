import vitest from '@vitest/eslint-plugin';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import perfectionist from 'eslint-plugin-perfectionist';
import testingLibrary from 'eslint-plugin-testing-library';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  perfectionist.configs['recommended-natural'],

  eslintConfigPrettier,

  {
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],
    ...vitest.configs.recommended,
  },

  {
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],
    ...testingLibrary.configs['flat/react'],
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
