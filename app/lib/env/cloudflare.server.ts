import type { AppLoadContext } from 'react-router';

export interface CloudflareEnv {
	VALUE_FROM_CLOUDFLARE?: string;
	[key: string]: unknown;
}

export function getCloudflareEnv(context?: AppLoadContext): CloudflareEnv {
	if (!context?.cloudflare?.env) return {};

	return context.cloudflare.env as unknown as CloudflareEnv;
}

export function getCloudflareContext(context?: AppLoadContext) {
	if (!context?.cloudflare) {
		return {
			ctx: {} as ExecutionContext,
			env: {} as Env,
		};
	}

	return context.cloudflare;
}
