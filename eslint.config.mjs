import core from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import deprecationPlugin from 'eslint-plugin-deprecation';
// @ts-expect-error [ts7016] -- I don't know why typing is broken here...
import importPlugin from 'eslint-plugin-import';
// @ts-expect-error [ts7016] -- I don't know why typing is broken here...
import jestPlugin from 'eslint-plugin-jest';
// @ts-expect-error [ts7016] -- I don't know why typing is broken here...
import { configs as unicornConfigs } from 'eslint-plugin-unicorn';
import { config, configs as typescriptConfigs } from 'typescript-eslint';

export default config(
  {
    ignores: ['coverage', 'dist', 'docs', 'examples', 'src/types/api-generated/**'],
  },
  core.configs.recommended,
  ...typescriptConfigs.strictTypeChecked,
  ...typescriptConfigs.stylisticTypeChecked,
  unicornConfigs['flat/recommended'],
  prettierConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      import: importPlugin,
      deprecation: deprecationPlugin,
    },
    rules: {
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-inferrable-types': [
        'error',
        {
          ignoreParameters: true,
        },
      ],
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'variable',
          types: ['function'],
          // arrow functions & react components
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        // {
        // 	"selector": "typeProperty",
        // 	"format": ["camelCase"]
        // },
        {
          selector: 'typeProperty',
          types: ['function'],
          format: ['camelCase', 'PascalCase'],
        },
      ],
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-var-requires': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/return-await': ['error', 'always'],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
          allowBoolean: true,
          allowAny: true,
          allowNullish: true,
        },
      ],
      '@typescript-eslint/typedef': [
        'error',
        {
          parameter: true,
          propertyDeclaration: true,
        },
      ],
      'import/extensions': ['error', 'ignorePackages'],
      'import/no-extraneous-dependencies': 'error',
      'import/no-unresolved': 'off',
      'import/no-useless-path-segments': 'error',
      quotes: [
        'error',
        'single',
        {
          allowTemplateLiterals: true,
        },
      ],
      'sort-imports': [
        'error',
        {
          allowSeparatedGroups: true,
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-event-target': 'off',
      'unicorn/filename-case': ['error'],
      'unicorn/no-null': 'off',
      'no-console': 'warn',
      'deprecation/deprecation': 'warn',
    },
  },
  {
    files: ['*.config.mjs'],
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    ...jestPlugin.configs['flat/recommended'],
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      'jest/expect-expect': [
        'error',
        {
          assertFunctionNames: ['expect', 'verify'],
          additionalTestBlockFunctions: [],
        },
      ],
      'unicorn/no-useless-undefined': [
        'warn',
        { checkArguments: false, checkArrowFunctionBody: false },
      ],
      'jest/no-mocks-import': 'error',
      'jest/prefer-expect-resolves': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
    },
  },
);
