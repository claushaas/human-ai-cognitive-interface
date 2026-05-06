import { useNavigate, useParams } from 'react-router';
import { AppShell } from '~/components/shell/AppShell';
import { Button } from '~/components/ui/Button';
import { Callout } from '~/components/ui/Callout';

export function meta({ params }: { params: { sessionId?: string } }) {
	return [
		{ title: `Sessão ${params.sessionId ?? ''} — HACI` },
		{
			content: 'Visualizar sessão de prompt HACI.',
			name: 'description',
		},
	];
}

export default function AppSession() {
	const { sessionId } = useParams();
	const navigate = useNavigate();

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
							{sessionId}
						</code>
					</p>
				</div>

				<Callout tone="info">
					<p>
						A retomada de sessões será implementada na <strong>Fase 6</strong>,
						quando a persistência em D1 estiver disponível.
					</p>
					<p className="mt-2 text-sm">
						Por enquanto, você pode criar um novo prompt a qualquer momento.
					</p>
				</Callout>

				<Button onClick={() => navigate('/app/new')}>Criar novo prompt</Button>
			</div>
		</AppShell>
	);
}
