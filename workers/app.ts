import type { ExportedHandler } from '@cloudflare/workers-types';
import { createRequestHandler } from '@react-router/cloudflare';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error: build/server é gerado dinamicamente pelo React Router
import * as build from '../build/server';

const requestHandler = createRequestHandler({
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error: tipo do build gerado dinamicamente
	build: () => build as unknown,
	getLoadContext: (eventContext) => {
		return { env: eventContext.env as Env };
	},
});

export default {
	fetch: requestHandler,
} satisfies ExportedHandler<Env>;

interface Env {
	DB: D1Database;
	CACHE: KVNamespace;
}
