import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
	route('app/new', 'routes/app.new.tsx'),
	route('app/session/:sessionId', 'routes/app.session.$sessionId.tsx'),
	route('app/history', 'routes/app.history.tsx'),
	route('app/export/:sessionId', 'routes/app.export.$sessionId.tsx'),
	route('health', 'routes/health.ts'),
] satisfies RouteConfig;
