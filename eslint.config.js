const js = require('@eslint/js');
const globals = require('globals');
const importPlugin = require('eslint-plugin-import');
const prettierPlugin = require('eslint-plugin-prettier');
const jestPlugin = require('eslint-plugin-jest');
module.exports = [
  js.configs.recommended,

  {
    files: ['**/*.js'],
    ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'import/no-duplicates': 'error',
    },
  },

  // ✅ excepción SOLO para el arranque del server
  {
    files: ['src/server.js'],
    rules: {
      'no-console': 'off',
    },
  },

  {
    files: ['tests/**/*.test.js'],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        beforeAll: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },
];
