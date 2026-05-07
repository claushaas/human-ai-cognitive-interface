import { Form, Link } from 'react-router';
import { AppShell } from '~/components/shell/AppShell';
import { Button } from '~/components/ui/Button';
import { Callout } from '~/components/ui/Callout';
import { Card } from '~/components/ui/Card';
import { requireUser } from '~/lib/auth/require-user.server';
import { createDbClient, getD1FromEnv } from '~/lib/db/client.server';
import {
	listSessionsForUser,
	softDeleteSession,
} from '~/lib/db/sessions.server';
import type { Route } from './+types/app.history';

export function meta() {
	return [
		{ title: 'Histórico — HACI' },
		{
			content: 'Histórico de sessões de prompt HACI.',
			name: 'description',
		},
	];
}

export async function loader({ context, request }: Route.LoaderArgs) {
	const user = await requireUser(
		request,
		context.cloudflare.env as unknown as Record<string, unknown>,
	);
	const d1 = getD1FromEnv(
		context.cloudflare.env as unknown as Record<string, unknown>,
	);
	const db = createDbClient(d1);

	const sessions = await listSessionsForUser(db, user.id);

	return {
		sessions: sessions.map((s: (typeof sessions)[number]) => ({
			createdAt: s.createdAt,
			id: s.id,
			status: s.status,
			title:
				s.title ??
				s.inputText.slice(0, 60) + (s.inputText.length > 60 ? '…' : ''),
			updatedAt: s.updatedAt,
		})),
	};
}

export async function action({ context, request }: Route.ActionArgs) {
	const user = await requireUser(
		request,
		context.cloudflare.env as unknown as Record<string, unknown>,
	);
	const d1 = getD1FromEnv(
		context.cloudflare.env as unknown as Record<string, unknown>,
	);
	const db = createDbClient(d1);

	const formData = await request.formData();
	const sessionId = formData.get('sessionId') as string;

	if (sessionId) {
		await softDeleteSession(db, sessionId, user.id);
	}

	return { success: true };
}

export default function AppHistory({ loaderData }: Route.ComponentProps) {
	const { sessions } = loaderData;

	return (
		<AppShell>
			<div className="space-y-8">
				<h1 className="font-serif text-2xl font-bold text-haci-text">
					Histórico
				</h1>

				{sessions.length === 0 ? (
					<Callout tone="info">
						Nenhuma sessão encontrada. Crie um novo prompt para começar.
					</Callout>
				) : null}

				{sessions.length > 0 && (
					<ul className="space-y-3">
						{sessions.map((s: (typeof sessions)[number]) => (
							<li key={s.id}>
								<Card className="transition-colors duration-150 hover:bg-haci-surface-subtle">
									<div className="flex items-center justify-between">
										<div className="flex flex-col gap-1">
											<Link
												className="font-medium text-sm text-haci-text hover:underline"
												to={`/app/session/${s.id}`}
											>
												{s.title}
											</Link>
											<p className="text-haci-text-subtle text-xs">
												{s.status} ·{' '}
												{new Date(s.updatedAt).toLocaleDateString('pt-BR')}
											</p>
										</div>
										<Form className="flex gap-2" method="post">
											<input name="sessionId" type="hidden" value={s.id} />
											<Button size="sm" type="submit" variant="ghost">
												Apagar
											</Button>
										</Form>
									</div>
								</Card>
							</li>
						))}
					</ul>
				)}
			</div>
		</AppShell>
	);
}
