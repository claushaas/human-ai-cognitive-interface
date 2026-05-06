import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			'~': new URL('./app', import.meta.url).pathname,
		},
	},
	test: {
		environment: 'node',
		globals: false,
		include: ['tests/unit/**/*.test.ts', 'app/**/*.test.ts'],
	},
});
