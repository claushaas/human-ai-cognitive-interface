import { useParams } from 'react-router';
import { AppShell } from '~/components/shell/AppShell';
import { Callout } from '~/components/ui/Callout';
import { DebugPanel } from '~/components/ui/DebugPanel';
import { ReviewPanel } from '~/components/ui/ReviewPanel';

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

				<Callout tone="warning">
					Esta tela reserva o ponto de visualização e edição de uma sessão HACI
					existente. A funcionalidade completa será implementada na{' '}
					<strong>Fase 6</strong>, após a persistência em D1 e a engine de
					match.
				</Callout>

				<ReviewPanel
					items={[
						{ label: 'Intenção', value: '[não implementado]' },
						{ label: 'Papel', value: '[não implementado]' },
						{ label: 'Ajustes', value: '[não implementado]' },
						{ label: 'Detalhes', value: '[não implementado]' },
						{ label: 'Idioma', value: 'pt-BR' },
						{ label: 'Formato', value: 'Markdown' },
					]}
				/>

				<DebugPanel
					data={{
						contract: null,
						levelMatch: null,
						rulersVector: null,
						version: 'v1 (placeholder)',
						warnings: [
							'Esta sessão é um placeholder. Nenhum dado real existe.',
						],
					}}
				/>

				<p className="text-haci-text-subtle text-sm">
					<em>
						Nenhuma sessão real é carregada. O ID acima é apenas uma referência
						de rota.
					</em>
				</p>
			</div>
		</AppShell>
	);
}
