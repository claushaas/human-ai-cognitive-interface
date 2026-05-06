import { useParams } from 'react-router';
import { AppShell } from '~/components/shell/AppShell';
import { Callout } from '~/components/ui/Callout';
import { CopyExportActions } from '~/components/ui/CopyExportActions';

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
					Esta tela reserva o ponto de exportação de uma sessão HACI em formato
					markdown ou texto puro. A funcionalidade será implementada na{' '}
					<strong>Fase 7</strong>, após a estrutura de sessão e a engine
					completa.
				</Callout>

				<div className="rounded-xl border border-haci-border bg-haci-surface p-6">
					<p className="text-haci-text-muted text-sm mb-4">
						Ações de exportação (não funcionais nesta fase):
					</p>
					<CopyExportActions />
				</div>

				<p className="text-haci-text-subtle text-sm">
					<em>
						Nenhum arquivo é gerado ainda. Esta é apenas uma reserva de rota.
					</em>
				</p>
			</div>
		</AppShell>
	);
}
