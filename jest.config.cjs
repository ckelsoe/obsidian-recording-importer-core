/** @type {import('jest').Config} */
module.exports = {
	testEnvironment: 'node',
	testMatch: ['**/__tests__/**/*.test.ts'],
	// `.ts` before `.js`, so an import never resolves a stray built `.js` beside
	// its source and the suite always asserts against the working tree.
	moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs', 'cjs', 'json', 'node'],
	// Installs the globals Obsidian injects at runtime (e.g. `createFragment`),
	// kept out of the test files because obsidianmd/no-global-this forbids it.
	setupFiles: ['<rootDir>/jest.setup.cjs'],
	// `obsidian` ships types only; the app provides the module at runtime.
	moduleNameMapper: {
		'^obsidian$': '<rootDir>/__tests__/__mocks__/obsidian.ts',
	},
	transform: {
		'^.+\\.ts$': [
			'ts-jest',
			{
				tsconfig: {
					// Override ESNext module to CommonJS for Jest compatibility
					module: 'CommonJS',
				},
			},
		],
	},
};
