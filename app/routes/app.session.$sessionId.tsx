import { useParams } from 'react-router';
import { AppShell } from '~/components/shell/AppShell';

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
			<div className="space-y-6">
				<h1 className="font-bold text-2xl text-neutral-900">Sessão</h1>
				<p className="text-neutral-600">
					ID:{' '}
					<code className="rounded bg-neutral-100 px-2 py-1 font-mono text-sm">
						{sessionId}
					</code>
				</p>
				<p className="max-w-prose text-neutral-600 leading-relaxed">
					Esta tela reserva o ponto de visualização e edição de uma sessão HACI
					existente. A funcionalidade completa será implementada na{' '}
					<strong>Fase 6</strong>, após a persistência em D1 e a engine de
					match.
				</p>
				<p className="text-neutral-500 text-sm">
					<em>
						Nenhuma sessão real é carregada. O ID acima é apenas uma referência
						de rota.
					</em>
				</p>
			</div>
		</AppShell>
	);
}
