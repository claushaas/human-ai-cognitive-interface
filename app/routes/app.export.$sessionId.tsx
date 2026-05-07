import { AppShell } from '~/components/shell/AppShell';
import { Callout } from '~/components/ui/Callout';
import { CopyExportActions } from '~/components/ui/CopyExportActions';
import { requireUser } from '~/lib/auth/require-user.server';
import { createDbClient, getD1FromEnv } from '~/lib/db/client.server';
import { getFeedbackForSession } from '~/lib/db/feedback.server';
import { exportSessionData } from '~/lib/db/session-export.server';
import {
	exportSessionAsJson,
	exportSessionAsMarkdown,
} from '~/lib/export/session-export.server';
import { recordInternalEvent } from '~/lib/observability/events.server';
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

	const feedback = await getFeedbackForSession(db, params.sessionId, user.id);

	const typedContract = data.contract as
		| import('~/domain/contracts').CognitiveContract
		| null
		| undefined;

	const exportInput = {
		answers: data.answers.map((a) => ({
			answeredAt: new Date().toISOString(),
			questionId: a.questionId,
			value: a.answerJson,
		})),
		contract: typedContract,
		createdAt: data.createdAt,
		feedback: feedback
			? {
					createdAt: feedback.createdAt,
					id: feedback.id,
					sessionId: feedback.sessionId,
					updatedAt: feedback.updatedAt ?? undefined,
					userId: feedback.userId,
					value: feedback.value as import('~/domain/contracts').FeedbackValue,
				}
			: null,
		id: data.id,
		initialRole: typedContract?.initialRole as string | null | undefined,
		levelMatch: data.levelMatch as
			| import('~/domain/contracts').LevelMatch
			| null
			| undefined,
		locale: data.locale,
		model: data.model,
		prompt: data.prompt,
		promptResult: data.promptResult as
			| import('~/domain/contracts').PromptGenerationResult
			| null
			| undefined,
		rawIntent: data.rawIntent as
			| import('~/domain/contracts').RawIntent
			| null
			| undefined,
		rulers: data.rulers as
			| import('~/domain/contracts').RulersVector
			| null
			| undefined,
		status: data.status,
		title: data.title,
		updatedAt: data.createdAt,
	};

	if (format === 'json') {
		recordInternalEvent({
			metadata: { format: 'json', sessionId: params.sessionId },
			sessionId: params.sessionId,
			timestamp: new Date().toISOString(),
			type: 'session.exported',
			userId: user.id,
		});

		return new Response(
			JSON.stringify(exportSessionAsJson(exportInput), null, 2),
			{
				headers: {
					'Content-Disposition': `attachment; filename="haci-session-${params.sessionId}.json"`,
					'Content-Type': 'application/json; charset=utf-8',
				},
			},
		);
	}

	recordInternalEvent({
		metadata: { format: 'markdown', sessionId: params.sessionId },
		sessionId: params.sessionId,
		timestamp: new Date().toISOString(),
		type: 'session.exported',
		userId: user.id,
	});

	return {
		jsonExport: JSON.stringify(exportSessionAsJson(exportInput), null, 2),
		markdownExport: exportSessionAsMarkdown(exportInput),
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
						Baixar JSON (debug)
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
						<h2 className="font-medium text-haci-text mb-4">JSON (debug)</h2>
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
