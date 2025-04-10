import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testMatch: ['**/**/**/__tests__/**/*.test.ts'],
	moduleNameMapper: {
		'@config': '<rootDir>/src/config/index',
		'@modules/(.*)': '<rootDir>/src/modules/$1',
		'@shared/(.*)': '<rootDir>/src/modules/shared/$1',
	},
	transform: {
		'^.+\\.tsx?$': 'ts-jest'
	},
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
};

export default config;