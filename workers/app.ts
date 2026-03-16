import type { ExportedHandler } from '@cloudflare/workers-types';
import { createRequestHandler } from '@react-router/cloudflare';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error: build/server é gerado dinamicamente pelo React Router
import * as build from '../build/server';

const requestHandler = createRequestHandler({
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error: tipo do build gerado dinamicamente
	build: () => build as unknown,
	getLoadContext(_request: Request, env: Env) {
		return { env };
	},
});

export default {
	async fetch(request: Request, _env: Env): Promise<Response> {
		return requestHandler(request);
	},
} satisfies ExportedHandler<Env>;

interface Env {
	DB: D1Database;
	CACHE: KVNamespace;
}
