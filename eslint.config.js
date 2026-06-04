import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'public', 'coverage']),

  // Main source files
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.test.ts', '**/*.test.tsx'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Disable over-aggressive rules that reject legitimate patterns
      'react-hooks/set-state-in-effect': 'off',
    },
  },

  // Test files: relax some rules
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      // Hooks in tests may legitimately be conditional
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },

  // i18n provider exports types + helper alongside component
  {
    files: ['src/i18n/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  // ErrorBoundary fallback intentionally calls useTranslation in try/catch
  {
    files: ['src/components/ErrorBoundary.tsx'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
])
