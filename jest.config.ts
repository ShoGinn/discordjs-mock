import type { JestConfigWithTsJest } from 'ts-jest';
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const jestConfig: JestConfigWithTsJest = {
	preset: 'ts-jest/presets/default-esm',
	resolver: 'ts-jest-resolver',
	moduleNameMapper: {
		'^(\\.{1,2}/.*/llhttp\\.wasm\\.js)$': '$1',
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	resetMocks: true,
	testTimeout: 60000,
	testEnvironment: 'node',
	testMatch: ['**/*.spec.ts(x)?'],
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				tsconfig: '<rootDir>/tsconfig.json',
			},
		],
	},
};

export default jestConfig;
