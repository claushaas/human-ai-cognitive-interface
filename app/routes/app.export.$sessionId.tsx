import { useParams } from 'react-router';
import { AppShell } from '~/components/shell/AppShell';

export function meta({ params }: { params: { sessionId?: string } }) {
	return [
		{ title: `Exportar ${params.sessionId ?? ''} — HACI` },
		{
			content: 'Exportar sessão de prompt HACI.',
			name: 'description',
		},
	];
}

export default function AppExport() {
	const { sessionId } = useParams();

	return (
		<AppShell>
			<div className="space-y-6">
				<h1 className="font-bold text-2xl text-neutral-900">Exportar</h1>
				<p className="text-neutral-600">
					ID:{' '}
					<code className="rounded bg-neutral-100 px-2 py-1 font-mono text-sm">
						{sessionId}
					</code>
				</p>
				<p className="max-w-prose text-neutral-600 leading-relaxed">
					Esta tela reserva o ponto de exportação de uma sessão HACI em formato
					markdown ou texto puro. A funcionalidade será implementada na
					<strong>Fase 7</strong>, após a estrutura de sessão e a engine
					completa.
				</p>
				<p className="text-neutral-500 text-sm">
					<em>
						Nenhum arquivo é gerado ainda. Esta é apenas uma reserva de rota.
					</em>
				</p>
			</div>
		</AppShell>
	);
}
