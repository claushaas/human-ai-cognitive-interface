import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	testDir: 'tests/e2e',
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry',
	},
	webServer: {
		command: 'pnpm dev',
		env: {
			APP_ENV: 'local',
			USE_MOCK_LLM: 'true',
		},
		port: 5173,
		reuseExistingServer: !process.env.CI,
		timeout: 30_000,
	},
});
