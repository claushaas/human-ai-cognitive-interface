import { useNavigate } from 'react-router';
import { AppShell } from '~/components/shell/AppShell';
import { Button } from '~/components/ui/Button';
import { Callout } from '~/components/ui/Callout';
import {
	CognitiveContractSchema,
	CollectionProtocolSchema,
	LevelMatchSchema,
	PromptGenerationResultSchema,
	RawIntentSchema,
	RulersVectorSchema,
} from '~/domain/contracts';
import PromptSessionFlow from '~/features/prompt-session/PromptSessionFlow';
import { requireUser } from '~/lib/auth/require-user.server';
import { createDbClient, getD1FromEnv } from '~/lib/db/client.server';
import {
	getSessionForUser,
	markSessionFailed,
	updateSessionCollectionProtocol,
	updateSessionContract,
	updateSessionIntent,
	updateSessionMatch,
	updateSessionPromptResult,
	updateSessionRoleAndRulers,
} from '~/lib/db/sessions.server';
import { getRuntimeEnv } from '~/lib/env/runtime.server';
import {
	consumePromptDailyLimit,
	RateLimitExceededError,
} from '~/lib/rate-limit/rate-limit.server';
import type { Route } from './+types/app.session.$sessionId';

export function meta({ params }: { params: { sessionId?: string } }) {
	return [
		{ title: `Sessão ${params.sessionId ?? ''} — HACI` },
		{
			content: 'Visualizar sessão de prompt HACI.',
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

	const session = await getSessionForUser(db, params.sessionId, user.id);

	if (!session) {
		throw new Response('Sessão não encontrada', { status: 404 });
	}

	return {
		session: {
			contractJson: session.contractJson,
			desiredOutcome: session.desiredOutcome,
			id: session.id,
			inputText: session.inputText,
			levelMatchJson: session.levelMatchJson,
			locale: session.locale,
			promptResultJson: session.promptResultJson,
			rawIntentJson: session.rawIntentJson,
			rulersJson: session.rulersJson,
			status: session.status,
			title: session.title,
		},
	};
}

export async function action({ context, params, request }: Route.ActionArgs) {
	const user = await requireUser(
		request,
		context.cloudflare.env as unknown as Record<string, unknown>,
	);
	const d1 = getD1FromEnv(
		context.cloudflare.env as unknown as Record<string, unknown>,
	);
	const db = createDbClient(d1);

	const formData = await request.formData();
	const action = formData.get('_action') as string;

	switch (action) {
		case 'saveIntent': {
			const rawIntentJson = formData.get('rawIntent') as string;
			const rawIntent = RawIntentSchema.parse(JSON.parse(rawIntentJson));
			await updateSessionIntent(db, {
				rawIntent,
				sessionId: params.sessionId,
				userId: user.id,
			});
			return { success: true };
		}

		case 'saveRoleAndRulers': {
			const initialRole = formData.get('initialRole') as string;
			const rulersJson = formData.get('rulers') as string;
			const rulers = RulersVectorSchema.parse(JSON.parse(rulersJson));
			await updateSessionRoleAndRulers(db, {
				initialRole: initialRole as import('~/domain/contracts').InitialRole,
				rulers,
				sessionId: params.sessionId,
				userId: user.id,
			});
			return { success: true };
		}

		case 'saveMatch': {
			const levelMatchJson = formData.get('levelMatch') as string;
			const levelMatch = LevelMatchSchema.parse(JSON.parse(levelMatchJson));
			await updateSessionMatch(db, {
				levelMatch,
				sessionId: params.sessionId,
				userId: user.id,
			});
			return { success: true };
		}

		case 'saveCollectionProtocol': {
			const protocolJson = formData.get('protocol') as string;
			const protocol = CollectionProtocolSchema.parse(JSON.parse(protocolJson));
			await updateSessionCollectionProtocol(db, {
				protocol,
				sessionId: params.sessionId,
				userId: user.id,
			});
			return { success: true };
		}

		case 'saveContract': {
			const contractJson = formData.get('contract') as string;
			const contract = CognitiveContractSchema.parse(JSON.parse(contractJson));
			await updateSessionContract(db, {
				contract,
				sessionId: params.sessionId,
				userId: user.id,
			});
			return { success: true };
		}

		case 'savePromptResult': {
			const env = getRuntimeEnv(
				context.cloudflare.env as unknown as Record<string, string | undefined>,
			);
			try {
				await consumePromptDailyLimit(db, user.id, env);
			} catch (err) {
				if (err instanceof RateLimitExceededError) {
					return { error: err.message, rateLimited: true };
				}
				throw err;
			}

			const promptResultJson = formData.get('promptResult') as string;
			const promptResult = PromptGenerationResultSchema.parse(
				JSON.parse(promptResultJson),
			);
			const model = (formData.get('model') as string) || undefined;
			await updateSessionPromptResult(db, {
				model,
				promptResult,
				sessionId: params.sessionId,
				userId: user.id,
			});
			return { success: true };
		}

		case 'markFailed': {
			const error = formData.get('error') as string;
			await markSessionFailed(db, {
				error,
				sessionId: params.sessionId,
				userId: user.id,
			});
			return { success: true };
		}

		default:
			return { error: 'Ação desconhecida' };
	}
}

export default function AppSession({ loaderData }: Route.ComponentProps) {
	const navigate = useNavigate();
	const { session } = loaderData;

	// If session is completed or failed, show summary
	if (session.status === 'completed' || session.status === 'failed') {
		return (
			<AppShell>
				<div className="space-y-8">
					<div className="space-y-2">
						<h1 className="font-serif text-2xl font-bold text-haci-text">
							Sessão
						</h1>
						<p className="text-haci-text-muted text-sm">
							ID:{' '}
							<code className="rounded bg-haci-surface-subtle px-2 py-1 text-xs">
								{session.id}
							</code>
						</p>
					</div>

					<Callout tone={session.status === 'completed' ? 'success' : 'danger'}>
						<p>
							Status: <strong>{session.status}</strong>
						</p>
						{session.inputText && (
							<p className="mt-2 text-sm">{session.inputText}</p>
						)}
					</Callout>

					<div className="flex gap-4">
						<Button onClick={() => navigate('/app/new')}>
							Criar novo prompt
						</Button>
						<Button
							onClick={() => navigate(`/app/export/${session.id}`)}
							variant="secondary"
						>
							Exportar
						</Button>
					</div>
				</div>
			</AppShell>
		);
	}

	// Try to hydrate the flow from session data
	const initialState: Partial<
		import('~/features/prompt-session/types').PromptSessionState
	> = {
		currentStep: 'intent',
		status: 'idle',
	};

	if (session.rawIntentJson) {
		try {
			const rawIntent = JSON.parse(session.rawIntentJson);
			initialState.rawIntent = rawIntent;
			initialState.status = 'editingIntent';
		} catch {
			// ignore parse errors
		}
	}

	if (session.rulersJson) {
		try {
			const rulers = JSON.parse(session.rulersJson);
			initialState.rulers = rulers;
			initialState.status = 'adjustingRulers';
		} catch {
			// ignore parse errors
		}
	}

	if (session.levelMatchJson) {
		try {
			const levelMatch = JSON.parse(session.levelMatchJson);
			initialState.levelMatch = levelMatch;
			initialState.status = 'matching';
		} catch {
			// ignore parse errors
		}
	}

	if (session.contractJson) {
		try {
			const contract = JSON.parse(session.contractJson);
			initialState.contract = contract;
			initialState.status = 'reviewing';
		} catch {
			// ignore parse errors
		}
	}

	if (session.promptResultJson) {
		try {
			const promptResult = JSON.parse(session.promptResultJson);
			initialState.promptResult = promptResult;
			initialState.status = 'completed';
		} catch {
			// ignore parse errors
		}
	}

	return (
		<PromptSessionFlow initialState={initialState} sessionId={session.id} />
	);
}
