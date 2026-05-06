import { AppShell } from '~/components/shell/AppShell';
import { Callout } from '~/components/ui/Callout';
import { HistoryList } from '~/components/ui/HistoryList';

export function meta() {
	return [
		{ title: 'Histórico — HACI' },
		{
			content: 'Histórico de sessões de prompt HACI.',
			name: 'description',
		},
	];
}

export default function AppHistory() {
	return (
		<AppShell>
			<div className="space-y-8">
				<h1 className="font-serif text-2xl font-bold text-haci-text">
					Histórico
				</h1>

				<Callout tone="info">
					Esta tela reserva o ponto de listagem de sessões HACI anteriores. A
					listagem completa será implementada na <strong>Fase 6</strong>, quando
					a persistência em D1 e a autenticação Cloudflare Access estiverem
					prontas.
				</Callout>

				<HistoryList emptyMessage="Nenhuma sessão encontrada." items={[]} />
			</div>
		</AppShell>
	);
}
