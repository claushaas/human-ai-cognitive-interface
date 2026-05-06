import { getRuntimeEnv } from '~/lib/env/runtime.server';
import { jsonOk } from '~/lib/http/responses.server';

export function loader() {
	const runtime = getRuntimeEnv();
	return jsonOk({
		app: 'haci',
		environment: runtime.APP_ENV,
		status: 'ok',
		timestamp: new Date().toISOString(),
	});
}
