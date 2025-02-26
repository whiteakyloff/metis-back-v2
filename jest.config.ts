import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testMatch: ['**/__tests__/**/*.test.ts'],
	moduleNameMapper: {
		'@config': '<rootDir>/src/config/index',
		'@domain/(.*)': '<rootDir>/src/domain/$1',
		'@presentation/(.*)': '<rootDir>/src/presentation/$1',
		'@infrastructure/(.*)': '<rootDir>/src/infrastructure/$1',
		'@application/(.*)': '<rootDir>/src/application/$1'
	},
	transform: {
		'^.+\\.tsx?$': 'ts-jest'
	},
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
};

export default config;