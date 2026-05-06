export type AppEnvironment = 'local' | 'staging' | 'production' | 'test';

export interface PublicEnv {
	APP_ENV: AppEnvironment;
	PUBLIC_BASE_URL: string;
	PUBLIC_APP_NAME: string;
	PUBLIC_DEFAULT_LOCALE: string;
	PUBLIC_SUPPORTED_LOCALES: string;
}

const defaults: PublicEnv = {
	APP_ENV: 'local',
	PUBLIC_APP_NAME: 'HACI',
	PUBLIC_BASE_URL: 'http://localhost:5173',
	PUBLIC_DEFAULT_LOCALE: 'pt-BR',
	PUBLIC_SUPPORTED_LOCALES: 'pt-BR,en',
};

export function getPublicEnv(): PublicEnv {
	if (typeof window !== 'undefined') {
		const env =
			(window as { __publicEnv?: Partial<PublicEnv> }).__publicEnv ?? {};
		return { ...defaults, ...env };
	}

	return defaults;
}
