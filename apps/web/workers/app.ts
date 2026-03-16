import { createRequestHandler } from "@react-router/cloudflare";
import * as build from "../build/server";

const requestHandler = createRequestHandler(build);

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return requestHandler(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;

interface Env {
	DB: D1Database;
	CACHE: KVNamespace;
}
