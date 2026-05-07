import type { AppEnvironment, PublicEnv } from './public';

export interface RuntimeEnv {
	APP_ENV: AppEnvironment;
	DEV_AUTH_EMAIL?: string;
	DEEPSEEK_API_KEY?: string;
	DEEPSEEK_BASE_URL?: string;
	LLM_ENABLED: boolean;
	LLM_MAX_RETRIES: string;
	LLM_MODEL: string;
	LLM_PROVIDER: string;
	LLM_TEMPERATURE: string;
	LLM_TIMEOUT_MS: string;
	PROMPT_DAILY_LIMIT: string;
	PUBLIC_BASE_URL: string;
	USE_MOCK_LLM: boolean;
}

const defaults: RuntimeEnv = {
	APP_ENV: 'local',
	DEEPSEEK_BASE_URL: 'https://api.deepseek.com',
	LLM_ENABLED: false,
	LLM_MAX_RETRIES: '1',
	LLM_MODEL: 'deepseek-v4-flash',
	LLM_PROVIDER: 'deepseek',
	LLM_TEMPERATURE: '0.2',
	LLM_TIMEOUT_MS: '30000',
	PROMPT_DAILY_LIMIT: '20',
	PUBLIC_BASE_URL: 'http://localhost:5173',
	USE_MOCK_LLM: true,
};

export function getRuntimeEnv(
	raw?: Record<string, string | undefined>,
): RuntimeEnv {
	if (!raw) return { ...defaults };

	return {
		APP_ENV: asAppEnv(raw.APP_ENV),
		DEEPSEEK_API_KEY: raw.DEEPSEEK_API_KEY,
		DEEPSEEK_BASE_URL: raw.DEEPSEEK_BASE_URL ?? defaults.DEEPSEEK_BASE_URL,
		DEV_AUTH_EMAIL: raw.DEV_AUTH_EMAIL,
		LLM_ENABLED: raw.LLM_ENABLED === 'true',
		LLM_MAX_RETRIES: raw.LLM_MAX_RETRIES ?? defaults.LLM_MAX_RETRIES,
		LLM_MODEL: raw.LLM_MODEL ?? defaults.LLM_MODEL,
		LLM_PROVIDER: raw.LLM_PROVIDER ?? defaults.LLM_PROVIDER,
		LLM_TEMPERATURE: raw.LLM_TEMPERATURE ?? defaults.LLM_TEMPERATURE,
		LLM_TIMEOUT_MS: raw.LLM_TIMEOUT_MS ?? defaults.LLM_TIMEOUT_MS,
		PROMPT_DAILY_LIMIT: raw.PROMPT_DAILY_LIMIT ?? defaults.PROMPT_DAILY_LIMIT,
		PUBLIC_BASE_URL: raw.PUBLIC_BASE_URL ?? defaults.PUBLIC_BASE_URL,
		USE_MOCK_LLM: raw.USE_MOCK_LLM === 'true' || raw.APP_ENV === 'local',
	};
}

function asAppEnv(value?: string): AppEnvironment {
	const valid = new Set<string>(['local', 'staging', 'production', 'test']);
	if (value && valid.has(value)) return value as AppEnvironment;
	return 'local';
}

export function getPublicEnvFromRuntime(runtime: RuntimeEnv): PublicEnv {
	return {
		APP_ENV: runtime.APP_ENV,
		PUBLIC_APP_NAME: 'HACI',
		PUBLIC_BASE_URL: runtime.PUBLIC_BASE_URL,
		PUBLIC_DEFAULT_LOCALE: 'pt-BR',
		PUBLIC_SUPPORTED_LOCALES: 'pt-BR,en',
	};
}
