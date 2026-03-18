import { createRequestHandler } from '@react-router/cloudflare';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error: build/server é gerado dinamicamente pelo React Router
import * as build from '../build/server';

interface Env {
	DB: D1Database;
	CACHE: KVNamespace;
}

const requestHandler = createRequestHandler<Env>({
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error: tipo do build gerado dinamicamente
	build: () => build as unknown,
	getLoadContext: ({ context }) => {
		return { env: context.cloudflare.env };
	},
});

export default {
	fetch: requestHandler,
};
