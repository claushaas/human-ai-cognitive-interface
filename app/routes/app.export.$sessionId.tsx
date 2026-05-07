import { AppShell } from '~/components/shell/AppShell';
import { Callout } from '~/components/ui/Callout';
import { CopyExportActions } from '~/components/ui/CopyExportActions';
import { requireUser } from '~/lib/auth/require-user.server';
import { createDbClient, getD1FromEnv } from '~/lib/db/client.server';
import {
	exportSessionData,
	formatAsJson,
	formatAsMarkdown,
} from '~/lib/db/session-export.server';
import type { Route } from './+types/app.export.$sessionId';

export function meta({ params }: { params: { sessionId?: string } }) {
	return [
		{ title: `Exportar ${params.sessionId ?? ''} — HACI` },
		{
			content: 'Exportar sessão de prompt HACI.',
			name: 'description',
		},
	];
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
	const user = await requireUser(
		request,
		context.cloudflare.env as unknown as Record<string, unknown>,
	);
	const d1 = getD1FromEnv(
		context.cloudflare.env as unknown as Record<string, unknown>,
	);
	const db = createDbClient(d1);

	const data = await exportSessionData(db, params.sessionId, user.id);

	if (!data) {
		throw new Response('Sessão não encontrada', { status: 404 });
	}

	const url = new URL(request.url);
	const format = url.searchParams.get('format') ?? 'markdown';

	if (format === 'json') {
		return new Response(formatAsJson(data), {
			headers: {
				'Content-Disposition': `attachment; filename="${params.sessionId}.json"`,
				'Content-Type': 'application/json',
			},
		});
	}

	return {
		jsonExport: formatAsJson(data),
		markdownExport: formatAsMarkdown(data),
		sessionId: params.sessionId,
	};
}

export default function AppExport({ loaderData }: Route.ComponentProps) {
	const { jsonExport, markdownExport, sessionId } = loaderData;

	return (
		<AppShell>
			<div className="space-y-8">
				<div className="space-y-2">
					<h1 className="font-serif text-2xl font-bold text-haci-text">
						Exportar
					</h1>
					<p className="text-haci-text-muted text-sm">
						ID:{' '}
						<code className="rounded bg-haci-surface-subtle px-2 py-1 text-xs">
							{sessionId}
						</code>
					</p>
				</div>

				<Callout tone="info">
					Exporte esta sessão em Markdown ou JSON para uso externo.{' '}
					<a
						className="underline"
						href={`/app/export/${sessionId}?format=json`}
					>
						Baixar JSON
					</a>
				</Callout>

				<div className="space-y-6">
					<div className="rounded-xl border border-haci-border bg-haci-surface p-6">
						<h2 className="font-medium text-haci-text mb-4">Markdown</h2>
						<pre className="text-xs text-haci-text-muted overflow-auto max-h-64 p-4 bg-haci-surface-subtle rounded-lg">
							{markdownExport}
						</pre>
					</div>

					<div className="rounded-xl border border-haci-border bg-haci-surface p-6">
						<h2 className="font-medium text-haci-text mb-4">JSON</h2>
						<pre className="text-xs text-haci-text-muted overflow-auto max-h-64 p-4 bg-haci-surface-subtle rounded-lg">
							{jsonExport}
						</pre>
					</div>
				</div>

				<CopyExportActions />
			</div>
		</AppShell>
	);
}
