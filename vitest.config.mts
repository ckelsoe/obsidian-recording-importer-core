import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		// `.ts` before `.js`, so an import never resolves a stray built `.js` beside
		// its source and the suite always asserts against the working tree.
		extensions: ['.ts', '.mts', '.mjs', '.js', '.json'],
		// `obsidian` ships types only; the app provides the module at runtime.
		alias: {
			obsidian: fileURLToPath(
				new URL('./__tests__/__mocks__/obsidian.ts', import.meta.url),
			),
		},
	},
	test: {
		globals: true,
		environment: 'node',
		include: ['__tests__/**/*.test.ts'],
		// Installs the globals Obsidian injects at runtime (e.g. `createFragment`),
		// kept out of the test files because obsidianmd/no-global-this forbids it.
		setupFiles: ['./vitest.setup.cjs'],
		testTimeout: 30_000,
	},
});
