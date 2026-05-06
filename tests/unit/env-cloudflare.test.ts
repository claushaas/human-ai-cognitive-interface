import { describe, expect, it } from 'vitest';
import {
	getCloudflareContext,
	getCloudflareEnv,
} from '~/lib/env/cloudflare.server';

describe('getCloudflareEnv', () => {
	it('retorna objeto vazio quando context é undefined', () => {
		const env = getCloudflareEnv();
		expect(env).toEqual({});
	});

	it('retorna objeto vazio quando context não tem cloudflare', () => {
		const env = getCloudflareEnv({} as { cloudflare?: unknown });
		expect(env).toEqual({});
	});

	it('extrai env do context Cloudflare', () => {
		const env = getCloudflareEnv({
			cloudflare: { env: { VALUE_FROM_CLOUDFLARE: 'hello' } },
		} as { cloudflare: { env: unknown } });
		expect(env.VALUE_FROM_CLOUDFLARE).toBe('hello');
	});
});

describe('getCloudflareContext', () => {
	it('retorna fallback vazio quando context é undefined', () => {
		const ctx = getCloudflareContext();
		expect(ctx.env).toEqual({});
		expect(ctx.ctx).toEqual({});
	});

	it('retorna cloudflare context quando disponível', () => {
		const fake = { ctx: { waitUntil: () => {} }, env: { FOO: 'bar' } };
		const ctx = getCloudflareContext({
			cloudflare: fake,
		} as { cloudflare: unknown });
		expect(ctx.env).toEqual(fake.env);
		expect(ctx.ctx).toEqual(fake.ctx);
	});
});
